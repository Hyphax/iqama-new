import * as React from 'react';

function useHandleStreamResponse({
  onChunk,
  onFinish
}) {
  const handleStreamResponse = React.useCallback(
    async (response, { signal } = {}) => {
      if (response.body) {
        const reader = response.body.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let content = "";
          try {
            while (true) {
              if (signal?.aborted) {
                await reader.cancel();
                break;
              }
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              content += chunk;
              onChunk(content);
            }
            // Final flush to handle any remaining bytes in the decoder
            const remaining = decoder.decode();
            if (remaining) {
              content += remaining;
              onChunk(content);
            }
          } catch (error) {
            await reader.cancel();
            throw error;
          } finally {
            onFinish(content);
          }
        }
      }
    },
    [onChunk, onFinish]
  );
  const handleStreamResponseRef = React.useRef(handleStreamResponse);
  React.useEffect(() => {
    handleStreamResponseRef.current = handleStreamResponse;
  }, [handleStreamResponse]);
  return React.useCallback((response, options) => handleStreamResponseRef.current(response, options), []);
}

export default useHandleStreamResponse;
