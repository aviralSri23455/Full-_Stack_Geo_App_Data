import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Check if a user is authenticated by checking for the token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }

    // Set up the Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create a gradient background using Three.js
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x44aa88,
      wireframe: true,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the cube for animation
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <Head>
        <title>Map Upload App</title>
        <meta name="description" content="Upload and process maps" />
      </Head>

      {/* 3D Background Canvas */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 z-0 w-full h-full" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-opacity-20 backdrop-blur-md">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white"></h1>
        </div>
      </header>

      {/* Main Section */}
      <main className="relative z-10 flex-grow">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Animated Header */}
            <motion.h2
              className="mb-8 text-4xl font-extrabold text-white transition duration-300 ease-in-out hover:text-blue-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
               Geo Data  App
            </motion.h2>
            {/* Animated Paragraph */}
            <motion.p
              className="max-w-2xl mx-auto mt-3 text-xl text-gray-100 sm:mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              Upload, visualize, and analyze your geographical data with our powerful mapping tools.
            </motion.p>

            {/* Buttons Section */}
            <div className="flex justify-center gap-4 mt-10">
              <Link
                href="/login"
                className="px-8 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-8 py-3 text-base font-medium text-gray-900 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 md:py-4 md:text-lg md:px-10"
              >
                Register
              </Link>
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="px-8 py-3 text-base font-medium text-gray-900 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 md:py-4 md:text-lg md:px-10"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-opacity-20 backdrop-blur-md">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <p className="text-center text-gray-100"></p>
        </div>
      </footer>
    </div>
  );
}
