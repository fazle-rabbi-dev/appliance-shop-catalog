/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	cacheComponents: true,
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
