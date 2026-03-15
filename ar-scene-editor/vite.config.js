import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path, { resolve } from 'path'
import fs from 'fs'

const assetsMiddleware = () => ({
    name: 'assets-api',
    configureServer(server) {
        server.middlewares.use('/api/assets', (req, res) => {
            const webarAssetsPath = path.resolve(__dirname, '../webar/assets')

            // Lista archivos solo del primer nivel (videos, models, etc.)
            const getFiles = (dir) => {
                try {
                    const fullDir = path.join(webarAssetsPath, dir)
                    const files = fs.readdirSync(fullDir)
                    return files.filter(f => !fs.statSync(path.join(fullDir, f)).isDirectory())
                } catch (e) {
                    return []
                }
            }

            // Lista archivos recursivamente (para Lottie con subcarpetas de assets)
            const getFilesRecursive = (dir, basePath = '') => {
                const results = []
                try {
                    const fullDir = path.join(webarAssetsPath, dir, basePath)
                    const entries = fs.readdirSync(fullDir, { withFileTypes: true })
                    for (const entry of entries) {
                        const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name
                        if (entry.isDirectory()) {
                            results.push(...getFilesRecursive(dir, relativePath))
                        } else if (entry.name.endsWith('.json')) {
                            results.push(relativePath)
                        }
                    }
                } catch (e) { /* ignore */ }
                return results
            }

            const response = {
                animations: getFilesRecursive('animations'),
                videos: getFiles('videos'),
                images: getFiles('images'),
                markers: getFiles('markers'),
                models: getFiles('models')
            }

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(response))
        })
    }
})

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), assetsMiddleware()],
    server: {
        port: 5174,
        force: true // Force dependency pre-bundling on restart just in case
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    publicDir: '../webar/assets', // Serve the actual webar/assets folder as the root public directory for dev server 
})
