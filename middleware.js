export const config = {
  // O matcher define quais rotas serão protegidas.
  // Protegemos a raiz e todos os subcaminhos
  matcher: '/:path*',
};

export default function middleware(request) {
  // Pula a autenticação se for a rota de ícone ou arquivos muito básicos
  // (opcional, mas bom para não quebrar PWA icons)
  const url = new URL(request.url);
  if (url.pathname.startsWith('/_vercel') || url.pathname.includes('favicon')) {
    return;
  }

  const authorizationHeader = request.headers.get('authorization');

  if (authorizationHeader) {
    const basicAuth = authorizationHeader.split(' ')[1];
    
    try {
      const [user, password] = atob(basicAuth).split(':');

      const expectedUser = process.env.SITE_USER || 'admin';
      const expectedPassword = process.env.SITE_PASSWORD || 'cirurgia123';

      if (user === expectedUser && password === expectedPassword) {
        // Autenticação bem-sucedida. O Vercel continuará o fluxo e carregará o site.
        return;
      }
    } catch (err) {
      // Falha no decode ou formato inválido
    }
  }

  // Se não tem header ou as credenciais estão incorretas, exige o login.
  return new Response('Acesso Restrito: Autenticação Necessária', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Cirurgia Notebook Secure Area"',
      'Content-Type': 'text/plain',
    },
  });
}
