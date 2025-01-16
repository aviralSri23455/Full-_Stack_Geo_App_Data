import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }

    if (canvasRef.current) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current, 
        alpha: true,
        antialias: true
      });
      rendererRef.current = renderer;
      
      const handleResize = () => {
        const container = canvasRef.current.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      };
      
      window.addEventListener('resize', handleResize);
      handleResize();

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
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('resize', handleResize);
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
        geometry.dispose();
        material.dispose();
      };
    }
  }, []);

  // Header animation variants
  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  // Footer animation variants
  const footerVariants = {
    initial: { y: 100, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Head>
        <title>Map Upload App</title>
        <meta name="description" content="Upload and process maps" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Background wrapper */}
      <div className="fixed inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="absolute inset-0">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Content wrapper */}
      <div className="relative flex flex-col min-h-screen">
        <motion.header 
          className={`sticky top-0 z-10 w-full transition-all duration-300 ease-in-out ${
            isScrolled ? 'bg-black bg-opacity-30' : 'bg-transparent'
          } backdrop-blur-md`}
          variants={headerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="px-4 py-3 mx-auto sm:px-6 lg:px-8 max-w-7xl md:py-6">
            <motion.h1 
              className="text-2xl font-bold text-white sm:text-3xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Geo App
            </motion.h1>
          </div>
        </motion.header>

        <main className="flex-grow w-full">
          <div className="px-4 py-6 mx-auto sm:px-6 lg:px-8 max-w-7xl md:py-12">
            <div className="text-center">
              <motion.h2
                className="mb-4 text-3xl font-extrabold text-white transition duration-300 ease-in-out hover:text-blue-200 sm:text-4xl md:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Geo Data App
              </motion.h2>
              <motion.p
                className="max-w-2xl mx-auto mt-2 text-base text-gray-100 sm:text-xl md:mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
              >
                Upload, visualize, and analyze your geographical data with our powerful mapping tools.
              </motion.p>

              <div className="flex flex-col justify-center gap-3 mt-6 sm:flex-row sm:gap-4 md:mt-10">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/login"
                      className="w-full px-6 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-transparent rounded-md sm:w-auto hover:bg-blue-700 md:py-3 md:text-base md:px-8"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="w-full px-6 py-2 text-sm font-medium text-gray-900 transition-colors bg-gray-200 border border-transparent rounded-md sm:w-auto hover:bg-gray-300 md:py-3 md:text-base md:px-8"
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/dashboard"
                    className="w-full px-6 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-transparent rounded-md sm:w-auto hover:bg-blue-700 md:py-3 md:text-base md:px-8"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>

        <motion.footer 
          className="w-full bg-black bg-opacity-20 backdrop-blur-md"
          variants={footerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="px-4 py-3 mx-auto sm:px-6 lg:px-8 max-w-7xl md:py-6">
            <motion.p 
              className="text-sm text-center text-gray-100 md:text-base"
              whileHover={{ scale: 1.02 }}
            >
              © 2025 Map Upload App. All rights reserved.
            </motion.p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Home;