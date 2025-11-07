/** @type {import('next').NextConfig} */
const remotePatterns = [
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '1337',
    pathname: '/uploads/**',
  },
  {
    protocol: 'http',
    hostname: '127.0.0.1',
    port: '1337',
    pathname: '/uploads/**',
  },
  {
    protocol: 'http',
    hostname: '0.0.0.0',
    port: '1337',
    pathname: '/uploads/**',
  },
];

const publicStrapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL ?? process.env.STRAPI_BASE_URL;
if (publicStrapiUrl) {
  try {
    const parsed = new URL(publicStrapiUrl);
    remotePatterns.push(
      {
        protocol: parsed.protocol.replace(':', ''),
        hostname: parsed.hostname,
        ...(parsed.port ? { port: parsed.port } : {}),
        pathname: '/uploads/**',
      },
    );
  } catch {
    // ignore invalid URL
  }
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
