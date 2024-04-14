import { file, serve } from 'bun';

serve({
  fetch(req) {
    return new Response(file("./src/index.min.html"));
  },
  port: 8080,
});