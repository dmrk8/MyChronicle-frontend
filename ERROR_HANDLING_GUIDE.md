# 404 & Error Handling Guide

This document explains how to use the 404 Not Found and Error handling components in the MyChronicle frontend.

## Components Overview

### 1. **NotFound Page** (src/pages/NotFound.tsx)
Enhanced 404/Not Found page that supports multiple error scenarios.

#### Props:
- \errorType\ (optional): 'route' | 'data' | 'server' - Type of error (default: 'route')
- \	title\ (optional): Custom title for the error
- \message\ (optional): Custom message for the error
- \showBackButton\ (optional): Show/hide back button (default: true)

#### Usage Examples:

**Route Not Found (Catch-all routes):**
\\\	sx
<Route path="*" element={<NotFound errorType="route" />} />
\\\

**Data Not Found (in components):**
\\\	sx
if (isError || !media) {
  return <NotFound errorType="data" title="Media Not Found" message="This anime doesn't exist." />;
}
\\\

**Server Error:**
\\\	sx
if (serverError) {
  return <NotFound errorType="server" />;
}
\\\

### 2. **ErrorBoundary Component** (src/components/ErrorBoundary.tsx)
React Error Boundary for catching and handling component errors globally.

#### Usage:
Wrap your app or specific sections with ErrorBoundary:

\\\	sx
<ErrorBoundary>
  <AppRoutes />
</ErrorBoundary>
\\\

Or wrap specific routes:
\\\	sx
<ErrorBoundary>
  <MediaDetailPage />
</ErrorBoundary>
\\\

## Error Handling Patterns

### 1. Route Not Found
Already handled by the catch-all route at the end of the router:
\\\	sx
<Route path="*" element={<NotFound />} />
\\\

### 2. Data Not Found (API Errors)
Example from MediaDetail page:
\\\	sx
const { data: media, isLoading, isError } = activeQuery;

if (isLoading) return <LoadingSkeletons />;

if (isError || !media) {
  return <NotFound errorType="data" />;
}

if (!isValidMediaType) {
  return <NotFound errorType="data" title="Invalid Media Type" message="This media type is not supported." />;
}
\\\

### 3. Component Runtime Errors
Automatically caught by ErrorBoundary without any additional code.

## Current Implementation

### Routes with Error Handling:
- ? MediaDetail - Shows data not found when media fails to load
- ? All unmatched routes - Caught by \<Route path="*" />\
- ? Invalid media types - Shows appropriate error message

### Error Types by Icon & Color:
- ?? **Route Not Found** - Blue (Border: blue-500/30)
- ?? **Data Not Found** - Orange (Border: amber-500/30)  
- ?? **Server Error** - Red (Border: red-500/30)

## Best Practices

1. **Use notFound with errorType property:**
   - 'route' for URL paths that don't exist
   - 'data' for missing content/data
   - 'server' for API failures and unexpected errors

2. **Loading States:**
   - Show skeletons during loads
   - Use NotFound only after loading completes

3. **Custom Messages:**
   - Provide context-specific messages when appropriate
   - Default messages work for generic errors

4. **Error Boundaries:**
   - Place at app root level in App.tsx or main.tsx
   - Can also place around route groups for granular control

## Environment-Specific Behavior

### Development:
- Error messages and stack traces are displayed
- Detailed error information helps debugging

### Production:
- Error details are hidden
- User-friendly messages are shown
