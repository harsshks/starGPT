# Production Safety & Cost Controls

This document explains the safety mechanisms implemented to prevent abuse and cost overruns in the StarGPT backend.

## Overview

The backend includes multiple layers of protection:
1. **Rate Limiting** - Prevents message spam
2. **Token Limits** - Caps context size and message length
3. **Error Handling** - Graceful degradation on API failures
4. **Usage Logging** - Track costs and identify abuse patterns

## 1. Rate Limiting

### Implementation

**File**: `backend/src/middlewares/rateLimiter.js`

Two rate limiters are configured:

1. **Chat Rate Limiter** (`chatRateLimiter`)
   - **Limit**: 20 messages per minute per user (configurable)
   - **Window**: 1 minute
   - **Key**: User ID (from JWT token)
   - **Applied to**: `/api/chat/stream` endpoint
   - **Response**: HTTP 429 with retry-after header

2. **General API Rate Limiter** (`apiRateLimiter`)
   - **Limit**: 100 requests per 15 minutes
   - **Window**: 15 minutes
   - **Key**: IP address or user ID
   - **Applied to**: All `/api/*` routes
   - **Response**: HTTP 429

### Configuration

Set via environment variables:
```bash
RATE_LIMIT_MESSAGES_PER_MINUTE=20  # Default: 20
```

### How It Prevents Abuse

- **Prevents spam**: Users cannot flood the API with rapid requests
- **Cost control**: Limits the number of Gemini API calls per user
- **Fair usage**: Ensures resources are distributed fairly among users
- **DDoS protection**: Reduces impact of automated attacks

### Example Response

When rate limit is exceeded:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Maximum 20 messages per minute.",
  "retryAfter": 60
}
```

Headers include:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in window
- `RateLimit-Reset`: Time when limit resets

---

## 2. Token Limits & Context Size Enforcement

### Implementation

**Files**:
- `backend/src/config/limits.js` - Configuration
- `backend/src/utils/tokenCounter.js` - Token estimation
- `backend/src/middlewares/contextValidator.js` - Validation middleware

### Limits Configured

```javascript
MAX_CONTEXT_TOKENS: 32000        // Total context (prompt + history)
MAX_USER_MESSAGE_TOKENS: 4000     // Single user message max
MAX_RESPONSE_TOKENS: 8000         // Max response tokens (informational)
```

### Token Estimation

Uses a simple approximation: **1 token ≈ 4 characters** (conservative estimate).

For production, consider using a proper tokenizer:
- `gpt-tokenizer` (for GPT models)
- `tiktoken` (OpenAI's tokenizer)
- Gemini's built-in token counting (if available)

### Validation Flow

1. **Pre-validation** (middleware):
   - Checks user message length before processing
   - Rejects if exceeds `MAX_USER_MESSAGE_TOKENS`

2. **Context validation** (controller):
   - After building full context (system prompt + summary + history + new message)
   - Rejects if exceeds `MAX_CONTEXT_TOKENS`
   - Prevents expensive API calls with oversized contexts

### Configuration

```bash
MAX_CONTEXT_TOKENS=32000           # Default: 32000
MAX_USER_MESSAGE_TOKENS=4000       # Default: 4000
MAX_RESPONSE_TOKENS=8000           # Default: 8000
TOKENS_PER_CHAR=0.25               # Default: 0.25 (1 token ≈ 4 chars)
```

### How It Prevents Cost Overruns

- **Caps API costs**: Larger contexts = more expensive API calls
- **Prevents abuse**: Users can't send extremely long messages
- **Predictable costs**: Maximum cost per request is bounded
- **Resource protection**: Prevents memory/processing overload

### Example Response

When context is too large:
```json
{
  "error": "Context too large",
  "message": "Context exceeds maximum token limit of 32000. Current: 45000 tokens.",
  "code": "CONTEXT_TOO_LARGE"
}
```

---

## 3. Graceful Gemini API Error Handling

### Implementation

**Files**:
- `backend/src/services/geminiService.js` - Enhanced error handling
- `backend/src/middlewares/errorMiddleware.js` - Centralized error handler

### Error Types Handled

1. **Quota Exceeded** (429)
   - **Detection**: Error message contains "quota" or "429"
   - **Response**: HTTP 429 with user-friendly message
   - **Action**: User should retry later

2. **Invalid Request** (400)
   - **Detection**: Error message contains "invalid" or "400"
   - **Response**: HTTP 400
   - **Action**: Check request format

3. **Permission Denied** (403)
   - **Detection**: Error message contains "permission" or "403"
   - **Response**: HTTP 403
   - **Action**: Check API key configuration

4. **Service Unavailable** (503)
   - **Default**: For any other Gemini API error
   - **Response**: HTTP 503
   - **Action**: Retry with exponential backoff

5. **Streaming Errors**
   - **Detection**: Errors during SSE stream
   - **Response**: SSE error event sent to client
   - **Action**: Client can retry or show error message

### Error Response Format

```json
{
  "error": "AI service temporarily unavailable. Please try again later.",
  "code": "GEMINI_API_ERROR"
}
```

In development mode, additional details are included:
```json
{
  "error": "...",
  "code": "GEMINI_API_ERROR",
  "details": "Original error message"
}
```

### How It Prevents Issues

- **User experience**: Clear error messages instead of crashes
- **Resilience**: System continues operating even if Gemini API fails
- **Debugging**: Structured error codes help identify issues
- **Cost control**: Prevents retrying failed requests unnecessarily

---

## 4. Centralized Error Handling

### Implementation

**File**: `backend/src/middlewares/errorMiddleware.js`

### Error Types Handled

- **Validation Errors**: Mongoose validation failures → 400
- **Cast Errors**: Invalid ObjectId format → 400
- **Duplicate Entries**: MongoDB unique constraint violations → 409
- **Gemini API Errors**: Mapped to appropriate HTTP status codes
- **Unknown Errors**: Default to 500 (Internal Server Error)

### Security Features

- **No stack traces in production**: Prevents information leakage
- **Structured responses**: Consistent error format
- **Error codes**: Machine-readable error identification
- **Logging**: All errors logged with context (user ID, path, method)

### Example Log Output

```
Error: {
  message: "Gemini API error",
  stack: "...",
  code: "QUOTA_EXCEEDED",
  status: 429,
  path: "/api/chat/stream",
  method: "GET",
  userId: "507f1f77bcf86cd799439011"
}
```

---

## 5. Usage Logging

### Implementation

**File**: `backend/src/services/usageLogger.js`

### What Gets Logged

For each chat completion:
```javascript
{
  userId: "507f1f77bcf86cd799439011",
  conversationId: "507f191e810c19729de860ea",
  timestamp: "2026-01-14T12:34:56.789Z",
  userMessageTokens: 150,
  assistantMessageTokens: 300,
  totalTokens: 450,
  durationMs: 2500,
  success: true,
  error: null
}
```

### Logging Points

1. **Successful completions**: Logged after stream completes
2. **Failed completions**: Logged even if error occurs
3. **Stream interruptions**: Logged with partial token counts

### Configuration

```bash
LOG_USAGE=true  # Default: true (set to 'false' to disable)
```

### How It Helps

- **Cost tracking**: Calculate total costs per user/conversation
- **Abuse detection**: Identify unusual usage patterns
- **Performance monitoring**: Track response times
- **Billing**: Generate usage reports for billing/quota systems

### Future Enhancements

Consider storing logs in:
- **Database**: Create `UsageLog` model for queryable history
- **Analytics service**: Send to DataDog, New Relic, etc.
- **Time-series DB**: InfluxDB for metrics visualization
- **Billing system**: Integrate with Stripe/Chargebee for usage-based billing

---

## Configuration Summary

### Environment Variables

```bash
# Rate Limiting
RATE_LIMIT_MESSAGES_PER_MINUTE=20

# Token Limits
MAX_CONTEXT_TOKENS=32000
MAX_USER_MESSAGE_TOKENS=4000
MAX_RESPONSE_TOKENS=8000
TOKENS_PER_CHAR=0.25

# Usage Logging
LOG_USAGE=true

# Environment
NODE_ENV=production  # Affects error detail exposure
```

### Recommended Production Settings

```bash
# Stricter limits for production
RATE_LIMIT_MESSAGES_PER_MINUTE=10
MAX_CONTEXT_TOKENS=16000
MAX_USER_MESSAGE_TOKENS=2000

# Enable logging
LOG_USAGE=true
NODE_ENV=production
```

---

## Cost Estimation

### Example Calculation

Assuming:
- Average user message: 100 tokens
- Average assistant response: 300 tokens
- Rate limit: 20 messages/minute
- Gemini API cost: $0.001 per 1K tokens (example)

**Per user per minute**:
- Max requests: 20
- Max tokens: 20 × (100 + 300) = 8,000 tokens
- Max cost: 8,000 / 1,000 × $0.001 = $0.008/minute

**Per user per hour** (if hitting limit):
- Max cost: $0.008 × 60 = $0.48/hour

**With rate limiting**:
- Without limits, a single user could potentially send hundreds of requests
- Rate limiting caps this at 20/minute, preventing runaway costs

---

## Monitoring & Alerts

### Recommended Monitoring

1. **Rate limit hits**: Alert if >10% of requests are rate-limited
2. **Token usage**: Alert if average context size exceeds threshold
3. **Error rates**: Alert if Gemini API error rate >5%
4. **Usage spikes**: Alert if token usage increases >50% day-over-day

### Metrics to Track

- Requests per user per hour
- Average tokens per request
- Error rate by type
- P95/P99 response times
- Total API costs per day

---

## Testing Safety Features

### Test Rate Limiting

```bash
# Send 25 requests rapidly (limit is 20)
for i in {1..25}; do
  curl -H "Authorization: Bearer $TOKEN" \
    "http://localhost:5000/api/chat/stream?conversationId=...&message=test"
done
# Should see 429 after 20 requests
```

### Test Token Limits

```bash
# Send a very long message (>4000 tokens ≈ 16,000 characters)
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/chat/stream?conversationId=...&message=$(python -c "print('x' * 20000)")"
# Should see 400 error
```

### Test Error Handling

```bash
# Use invalid API key (in .env)
GEMINI_API_KEY=invalid_key
# Should see 403 or 503 error with proper message
```

---

## Summary

These safety mechanisms work together to:

1. **Prevent abuse**: Rate limiting stops spam and automated attacks
2. **Control costs**: Token limits cap expensive API calls
3. **Ensure reliability**: Error handling prevents crashes
4. **Enable monitoring**: Usage logging tracks costs and patterns

All features are **configurable** via environment variables, allowing you to adjust limits based on your needs and budget.
