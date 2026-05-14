import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	turbopack: false,

	webpack: (config, { isServer, dev }) => {
		config.resolve.alias = {
			...config.resolve.alias,
			lightningcss: false,
		};
		return config;
	},

	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'example.com',
				port: '',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
