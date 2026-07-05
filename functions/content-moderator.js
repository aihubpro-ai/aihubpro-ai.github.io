// Ye function har request pe chalega aur illegal content block karega
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Illegal URL patterns block karo
  const ILLEGAL_PATHS = [
    '/bomb', '/drug', '/poison', '/hack', '/weapon',
    '/terrorism', '/child-abuse', '/cp'
  ];

  if (ILLEGAL_PATHS.some(path => url.pathname.includes(path))) {
    return new Response('403 Forbidden - Illegal Content', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // Normal request continue
  return next();
}
