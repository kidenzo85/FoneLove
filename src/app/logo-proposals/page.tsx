'use client'

import React, { useState, useEffect } from 'react'
import { 
  Sparkles, Smartphone, Code, Copy, Check, Eye, X, 
  RefreshCw, Play, Volume2, HelpCircle, Heart, PhoneCall
} from 'lucide-react'

// Define the 20 animations with their names, descriptions, and custom SVG codes
interface AnimationItem {
  id: number
  name: string
  description: string
  category: 'Élégant' | 'Dynamique' | 'Premium' | 'Ludique'
  svgCode: string
}

const ANIMATIONS: AnimationItem[] = [
  {
    id: 1,
    name: "1. Pulsation Lumineuse (Pulse Glow)",
    description: "Le logo complet respire doucement avec un effet de halo lumineux en arrière-plan.",
    category: "Élégant",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-1" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="glow-1" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="25" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <style>
    @keyframes pulse-glow-1 {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(236,72,153,0.4)); }
      50% { transform: scale(1.03); filter: drop-shadow(0 0 35px rgba(236,72,153,0.8)) drop-shadow(0 0 15px rgba(245,158,11,0.4)); }
    }
    .anim-1-group {
      transform-origin: center;
      animation: pulse-glow-1 2.5s infinite ease-in-out;
    }
  </style>
  <g class="anim-1-group">
    <rect width="512" height="512" rx="120" fill="url(#logo-grad-1)"/>
    <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
    <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
  </g>
</svg>`
  },
  {
    id: 2,
    name: "2. Battement de Cœur Réaliste (Heartbeat Connection)",
    description: "Le cœur bat avec un double sursaut réaliste pendant que le téléphone vibre en rythme.",
    category: "Dynamique",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-2" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes heartbeat-2 {
      0%, 60%, 100% { transform: translate(20px, -20px) scale(0.9); }
      10% { transform: translate(20px, -20px) scale(1.1); }
      20% { transform: translate(20px, -20px) scale(0.95); }
      30% { transform: translate(20px, -20px) scale(1.15); }
    }
    @keyframes phone-vibe-2 {
      0%, 60%, 100% { transform: rotate(0deg); }
      32% { transform: rotate(-3deg); }
      34% { transform: rotate(3deg); }
      36% { transform: rotate(-3deg); }
      38% { transform: rotate(3deg); }
      40% { transform: rotate(0deg); }
    }
    .anim-2-heart {
      transform-origin: 338px 221px;
      animation: heartbeat-2 1.8s infinite ease-in-out;
    }
    .anim-2-phone {
      transform-origin: 265px 295px;
      animation: phone-vibe-2 1.8s infinite ease-in-out;
    }
  </style>
  <rect width="512" height="512" rx="120" fill="url(#logo-grad-2)"/>
  <path class="anim-2-phone" d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
  <path class="anim-2-heart" d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
</svg>`
  },
  {
    id: 3,
    name: "3. Trait de Lumière Rotatif (Orbiting Loader)",
    description: "Une élégante piste pointillée rotative encercle le logo pour simuler le chargement.",
    category: "Premium",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-3" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="orbit-grad-3" x1="0" y1="0" x2="512" y2="512">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes orbit-rotate-3 {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .anim-3-ring {
      transform-origin: 256px 256px;
      animation: orbit-rotate-3 2s infinite linear;
    }
  </style>
  <rect width="512" height="512" rx="120" fill="url(#logo-grad-3)"/>
  <circle class="anim-3-ring" cx="256" cy="256" r="215" stroke="url(#orbit-grad-3)" stroke-width="12" stroke-linecap="round" stroke-dasharray="350 400" fill="none" />
  <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
  <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
</svg>`
  },
  {
    id: 4,
    name: "4. Tracé Vectoriel Progressif (Self-Drawing Contour)",
    description: "Les contours blancs du logo s'écrivent d'abord, puis le remplissage se révèle.",
    category: "Premium",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-4" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes draw-4 {
      0% { stroke-dashoffset: 1200; fill-opacity: 0; }
      50% { stroke-dashoffset: 0; fill-opacity: 0; }
      80%, 100% { stroke-dashoffset: 0; fill-opacity: 1; }
    }
    .anim-4-path {
      stroke: white;
      stroke-width: 8;
      stroke-dasharray: 1200;
      stroke-dashoffset: 1200;
      animation: draw-4 3.5s infinite ease-in-out;
    }
  </style>
  <rect width="512" height="512" rx="120" fill="url(#logo-grad-4)"/>
  <path class="anim-4-path" d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" />
  <path class="anim-4-path" d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" transform="translate(20, -20) scale(0.9)" />
</svg>`
  },
  {
    id: 5,
    name: "5. Dégradé Fluide Mouvant (Morphing Gradient)",
    description: "Les couleurs du dégradé de fond bougent doucement comme un fluide rose-violet-orange chaleureux.",
    category: "Élégant",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop id="stop-5a" offset="0%" stop-color="#ec4899"/>
      <stop id="stop-5b" offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes color-morph-5a {
      0%, 100% { stop-color: #ec4899; }
      33% { stop-color: #d946ef; }
      66% { stop-color: #8b5cf6; }
    }
    @keyframes color-morph-5b {
      0%, 100% { stop-color: #f59e0b; }
      33% { stop-color: #ff007f; }
      66% { stop-color: #f43f5e; }
    }
    #stop-5a {
      animation: color-morph-5a 6s infinite ease-in-out;
    }
    #stop-5b {
      animation: color-morph-5b 6s infinite ease-in-out;
    }
  </style>
  <rect width="512" height="512" rx="120" fill="url(#logo-grad-5)"/>
  <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
  <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
</svg>`
  },
  {
    id: 6,
    name: "6. Flottement et Ombre Portée (Floating Suspension)",
    description: "Le logo flotte verticalement de haut en bas tandis que son ombre s'estompe et grossit.",
    category: "Élégant",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-6" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes float-6 {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    @keyframes shadow-6 {
      0%, 100% { transform: scale(1); opacity: 0.2; }
      50% { transform: scale(0.8); opacity: 0.08; }
    }
    .anim-6-box {
      transform-origin: center;
      animation: float-6 3s infinite ease-in-out;
    }
    .anim-6-shadow {
      transform-origin: 256px 480px;
      animation: shadow-6 3s infinite ease-in-out;
    }
  </style>
  <!-- Floor Shadow -->
  <ellipse class="anim-6-shadow" cx="256" cy="480" rx="160" ry="16" fill="black" opacity="0.2" />
  
  <g class="anim-6-box">
    <rect width="512" height="512" rx="120" fill="url(#logo-grad-6)"/>
    <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
    <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
  </g>
</svg>`
  },
  {
    id: 7,
    name: "7. Retournement 3D Continu (3D Flip)",
    description: "Le logo pivote de manière tridimensionnelle avec un effet de perspective moderne.",
    category: "Dynamique",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-7" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes flip-7 {
      0% { transform: rotateY(0deg); }
      100% { transform: rotateY(360deg); }
    }
    .anim-7-box {
      transform-origin: 256px 256px;
      animation: flip-7 3.5s infinite ease-in-out;
    }
  </style>
  <g class="anim-7-box">
    <rect width="512" height="512" rx="120" fill="url(#logo-grad-7)"/>
    <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
    <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
  </g>
</svg>`
  },
  {
    id: 8,
    name: "8. Orbite Romantique (Heart Orbit)",
    description: "Le cœur tourne en orbite tridimensionnelle autour du téléphone, se cachant derrière lui.",
    category: "Ludique",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-8" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes orbit-8 {
      0% { transform: translate(0px, 0px) scale(0.9); z-index: 10; }
      25% { transform: translate(-100px, 40px) scale(0.7); }
      50% { transform: translate(-150px, 0px) scale(0.5); opacity: 0.7; }
      75% { transform: translate(-80px, -60px) scale(0.7); }
      100% { transform: translate(0px, 0px) scale(0.9); z-index: 10; }
    }
    .anim-8-heart {
      transform-origin: 338px 221px;
      animation: orbit-8 3s infinite ease-in-out;
    }
  </style>
  <rect width="512" height="512" rx="120" fill="url(#logo-grad-8)"/>
  <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
  <path class="anim-8-heart" d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
</svg>`
  },
  {
    id: 9,
    name: "9. Appel Téléphonique Vibrant (Ringing Vibe)",
    description: "Le combiné vibre énergiquement comme lors de la réception d'un appel romantique.",
    category: "Dynamique",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-9" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes ring-vibe-9 {
      0%, 50%, 100% { transform: scale(1) rotate(0deg); }
      5%, 15%, 25%, 35% { transform: scale(1.02) rotate(-4deg); }
      10%, 20%, 30%, 40% { transform: scale(1.02) rotate(4deg); }
      45% { transform: scale(1) rotate(0deg); }
    }
    .anim-9-phone {
      transform-origin: 256px 295px;
      animation: ring-vibe-9 2s infinite ease-in-out;
    }
  </style>
  <rect width="512" height="512" rx="120" fill="url(#logo-grad-9)"/>
  <path class="anim-9-phone" d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
  <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
</svg>`
  },
  {
    id: 10,
    name: "10. Remplissage Liquide (Wave Liquid Fill)",
    description: "Le blanc du combiné et du cœur se remplit de bas en haut comme un liquide coloré.",
    category: "Premium",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-10" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
    <clipPath id="logo-mask-10">
      <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" />
      <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" transform="translate(20, -20) scale(0.9)" />
    </clipPath>
  </defs>
  <style>
    @keyframes liquid-fill-10 {
      0% { transform: translateY(350px); }
      50% { transform: translateY(-50px); }
      100% { transform: translateY(350px); }
    }
    .anim-10-liquid {
      animation: liquid-fill-10 4s infinite ease-in-out;
    }
  </style>
  <rect width="512" height="512" rx="120" fill="url(#logo-grad-10)"/>
  
  <!-- Base outline in low opacity -->
  <g opacity="0.3">
    <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
    <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
  </g>

  <!-- Masked filled content -->
  <g clip-path="url(#logo-mask-10)">
    <rect width="512" height="512" fill="white" opacity="0.4" />
    <!-- Rising liquid wave -->
    <path class="anim-10-liquid" d="M0 300 C 120 270, 240 330, 512 300 L512 512 L0 512 Z" fill="white" />
  </g>
</svg>`
  },
  {
    id: 11,
    name: "11. Ondes de Propagation (Radar Ripple)",
    description: "Des cercles de pulsation circulaires émanent en boucle du cœur vers l'extérieur.",
    category: "Dynamique",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-11" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes ripple-11 {
      0% { r: 0px; opacity: 1; stroke-width: 8; }
      100% { r: 180px; opacity: 0; stroke-width: 1; }
    }
    .anim-11-circle-1 {
      animation: ripple-11 2s infinite cubic-bezier(0.1, 0.8, 0.3, 1);
    }
    .anim-11-circle-2 {
      animation: ripple-11 2s infinite cubic-bezier(0.1, 0.8, 0.3, 1);
      animation-delay: 1s;
    }
  </style>
  <rect width="512" height="512" rx="120" fill="url(#logo-grad-11)"/>
  <circle class="anim-11-circle-1" cx="370" cy="180" r="0" stroke="white" fill="none" />
  <circle class="anim-11-circle-2" cx="370" cy="180" r="0" stroke="white" fill="none" />
  
  <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
  <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
</svg>`
  },
  {
    id: 12,
    name: "12. Balayage Métallique (Shimmer Shine)",
    description: "Une ligne de brillance argentée balaie obliquement le logo pour un aspect haut de gamme.",
    category: "Premium",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-12" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="shine-grad-12" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.6" />
      <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
    <mask id="logo-mask-12">
      <rect width="512" height="512" rx="120" fill="white" />
    </mask>
  </defs>
  <style>
    @keyframes shine-sweep-12 {
      0% { transform: translate(-450px, -450px) rotate(45deg); }
      70%, 100% { transform: translate(450px, 450px) rotate(45deg); }
    }
    .anim-12-shimmer {
      animation: shine-sweep-12 3s infinite ease-in-out;
    }
  </style>
  <g mask="url(#logo-mask-12)">
    <rect width="512" height="512" rx="120" fill="url(#logo-grad-12)"/>
    <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
    <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
    
    <!-- Shimmer Bar -->
    <rect class="anim-12-shimmer" x="-100" y="-300" width="150" height="1000" fill="url(#shine-grad-12)" />
  </g>
</svg>`
  },
  {
    id: 13,
    name: "13. Assemblage Géométrique (Dynamic Assembly)",
    description: "Le fond, le combiné et le cœur arrivent de directions opposées et s'assemblent.",
    category: "Dynamique",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-13" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes bg-in-13 {
      0% { transform: scale(0); opacity: 0; }
      15%, 85% { transform: scale(1); opacity: 1; }
      100% { transform: scale(0); opacity: 0; }
    }
    @keyframes phone-in-13 {
      0%, 10% { transform: translateX(-300px); opacity: 0; }
      30%, 80% { transform: translateX(0px); opacity: 1; }
      95%, 100% { transform: translateX(-300px); opacity: 0; }
    }
    @keyframes heart-in-13 {
      0%, 20% { transform: translate(300px, -300px) scale(0.9); opacity: 0; }
      40%, 75% { transform: translate(20px, -20px) scale(0.9); opacity: 1; }
      90%, 100% { transform: translate(300px, -300px) scale(0.9); opacity: 0; }
    }
    .anim-13-bg {
      transform-origin: center;
      animation: bg-in-13 4s infinite cubic-bezier(0.17, 0.67, 0.83, 0.67);
    }
    .anim-13-phone {
      animation: phone-in-13 4s infinite cubic-bezier(0.17, 0.67, 0.25, 1);
    }
    .anim-13-heart {
      animation: heart-in-13 4s infinite cubic-bezier(0.17, 0.67, 0.25, 1);
    }
  </style>
  <rect class="anim-13-bg" width="512" height="512" rx="120" fill="url(#logo-grad-13)"/>
  <path class="anim-13-phone" d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
  <path class="anim-13-heart" d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
</svg>`
  },
  {
    id: 14,
    name: "14. Néon Clignotant Cyber (Cyber Neon Flicker)",
    description: "Les éléments s'illuminent comme un néon rose vif avec de légers faux-contacts.",
    category: "Dynamique",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="neon-glow-14" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur1" />
      <feGaussianBlur stdDeviation="4" result="blur2" />
      <feMerge>
        <feMergeNode in="blur1" />
        <feMergeNode in="blur2" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <style>
    @keyframes flicker-14 {
      0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; filter: url(#neon-glow-14); }
      19%, 21%, 23%, 24%, 54%, 56% { opacity: 0.3; filter: none; }
    }
    .anim-14-lines {
      stroke: #ff2a85;
      stroke-width: 14;
      stroke-linecap: round;
      stroke-linejoin: round;
      animation: flicker-14 3s infinite linear;
    }
  </style>
  <rect width="512" height="512" rx="120" fill="#05050d" stroke="#ff2a85" stroke-width="4"/>
  
  <path class="anim-14-lines" d="M170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200C150 188.954 158.954 180 170 180Z" fill="none" />
  <path class="anim-14-lines" d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="none" transform="translate(20, -20) scale(0.9)" />
</svg>`
  },
  {
    id: 15,
    name: "15. Particules de Cœur Magiques (Love Sparkles)",
    description: "Des petites étoiles et des étincelles jaillissent doucement derrière le cœur du logo.",
    category: "Ludique",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-15" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes sparkle-fade-15 {
      0%, 100% { opacity: 0; transform: scale(0.3) translate(0px, 0px); }
      50% { opacity: 1; transform: scale(1.1) translate(var(--tx), var(--ty)); }
    }
    .anim-15-sparkle {
      fill: #ffffff;
      transform-origin: 370px 180px;
      animation: sparkle-fade-15 2s infinite ease-out;
    }
    .sp1 { --tx: -40px; --ty: -30px; animation-delay: 0.2s; }
    .sp2 { --tx: 30px; --ty: -40px; animation-delay: 0.6s; }
    .sp3 { --tx: -20px; --ty: 50px; animation-delay: 1.0s; }
    .sp4 { --tx: 50px; --ty: 30px; animation-delay: 1.4s; }
  </style>
  <rect width="512" height="512" rx="120" fill="url(#logo-grad-15)"/>
  
  <!-- Sparkles -->
  <path class="anim-15-sparkle sp1" d="M370 170 L372 178 L380 180 L372 182 L370 190 L368 182 L360 180 L368 178 Z" />
  <path class="anim-15-sparkle sp2" d="M370 170 L372 178 L380 180 L372 182 L370 190 L368 182 L360 180 L368 178 Z" />
  <path class="anim-15-sparkle sp3" d="M370 170 L372 178 L380 180 L372 182 L370 190 L368 182 L360 180 L368 178 Z" />
  <path class="anim-15-sparkle sp4" d="M370 170 L372 178 L380 180 L372 182 L370 190 L368 182 L360 180 L368 178 Z" />
  
  <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
  <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
</svg>`
  },
  {
    id: 16,
    name: "16. Respiration Élastique (Elastic Breathing)",
    description: "Le logo subit une contraction élastique suivie d'un étirement fluide.",
    category: "Élégant",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-16" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes breathe-16 {
      0% { transform: scale(0.92); }
      40% { transform: scale(1.05); }
      55% { transform: scale(0.97); }
      70% { transform: scale(1.02); }
      100% { transform: scale(0.92); }
    }
    .anim-16-group {
      transform-origin: 256px 256px;
      animation: breathe-16 2.8s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
  </style>
  <g class="anim-16-group">
    <rect width="512" height="512" rx="120" fill="url(#logo-grad-16)"/>
    <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
    <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
  </g>
</svg>`
  },
  {
    id: 17,
    name: "17. Contour Lumineux Rotatif (Stroke Orbit Tracer)",
    description: "Une comète blanche tourne en continu le long de la bordure du rectangle.",
    category: "Premium",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-17" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes stroke-run-17 {
      0% { stroke-dashoffset: 1650; }
      100% { stroke-dashoffset: 0; }
    }
    .anim-17-border {
      stroke: white;
      stroke-width: 10;
      stroke-linecap: round;
      stroke-dasharray: 200 1450;
      animation: stroke-run-17 3s infinite linear;
    }
  </style>
  <rect width="512" height="512" rx="120" fill="url(#logo-grad-17)"/>
  <rect class="anim-17-border" x="5" y="5" width="502" height="502" rx="115" fill="none" />
  
  <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
  <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
</svg>`
  },
  {
    id: 18,
    name: "18. Transition 3D Origami (Origami Skew)",
    description: "Le logo se plie et s'incline légèrement de gauche à droite de manière dynamique.",
    category: "Dynamique",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-18" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes skew-18 {
      0%, 100% { transform: skewX(0deg) skewY(0deg) scale(1); }
      25% { transform: skewX(6deg) skewY(-2deg) scale(0.98); }
      75% { transform: skewX(-6deg) skewY(2deg) scale(0.98); }
    }
    .anim-18-group {
      transform-origin: 256px 256px;
      animation: skew-18 4s infinite ease-in-out;
    }
  </style>
  <g class="anim-18-group">
    <rect width="512" height="512" rx="120" fill="url(#logo-grad-18)"/>
    <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
    <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
  </g>
</svg>`
  },
  {
    id: 19,
    name: "19. Égaliseur Graphique Vocal (Calling Sound Wave)",
    description: "Des barres de fréquences vocales oscillent au pied du téléphone pour évoquer l'appel.",
    category: "Ludique",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-19" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes wave-bounce-19 {
      0%, 100% { transform: scaleY(0.3); }
      50% { transform: scaleY(1.3); }
    }
    .anim-19-bar {
      fill: white;
      transform-origin: bottom;
      animation: wave-bounce-19 1.2s infinite ease-in-out;
    }
    .b19-1 { animation-delay: 0.1s; }
    .b19-2 { animation-delay: 0.4s; }
    .b19-3 { animation-delay: 0.2s; }
    .b19-4 { animation-delay: 0.6s; }
    .b19-5 { animation-delay: 0.3s; }
  </style>
  <rect width="512" height="512" rx="120" fill="url(#logo-grad-19)"/>
  
  <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
  <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
  
  <!-- Sound Waves at bottom left/center -->
  <rect class="anim-19-bar b19-1" x="220" y="320" width="8" height="40" rx="4" />
  <rect class="anim-19-bar b19-2" x="234" y="320" width="8" height="60" rx="4" />
  <rect class="anim-19-bar b19-3" x="248" y="320" width="8" height="75" rx="4" />
  <rect class="anim-19-bar b19-4" x="262" y="320" width="8" height="50" rx="4" />
  <rect class="anim-19-bar b19-5" x="276" y="320" width="8" height="30" rx="4" />
</svg>`
  },
  {
    id: 20,
    name: "20. Halo Cosmique (Cosmic Aura)",
    description: "Une aura lumineuse colorée tourne doucement en arrière-plan du logo.",
    category: "Premium",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-20" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
    <radialGradient id="halo-grad-20" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff007f" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <style>
    @keyframes halo-rotate-20 {
      0% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.15) rotate(180deg); opacity: 0.8; }
      100% { transform: scale(1) rotate(360deg); }
    }
    .anim-20-halo {
      transform-origin: 256px 256px;
      animation: halo-rotate-20 6s infinite ease-in-out;
    }
  </style>
  <rect width="512" height="512" rx="120" fill="#0c0a1c" />
  
  <!-- Glowing Rotating Halo -->
  <circle class="anim-20-halo" cx="256" cy="256" r="230" fill="url(#halo-grad-20)" />
  
  <!-- Logo card over the halo -->
  <rect x="36" y="36" width="440" height="440" rx="100" fill="url(#logo-grad-20)"/>
  
  <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" transform="translate(-10, -5) scale(0.95)" transform-origin="center" />
  <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(10, -25) scale(0.85)" />
</svg>`
  },
  {
    id: 21,
    name: "21. Contour Progressif & Orbite de Chargement (Combinaison 3 & 4)",
    description: "Le contour blanc du combiné et du cœur se dessine de manière fluide, tandis qu'une élégante ligne orbitale blanche tourne autour pour simuler le chargement.",
    category: "Premium",
    svgCode: `<svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-grad-21" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="orbit-grad-21" x1="0" y1="0" x2="512" y2="512">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <style>
    @keyframes orbit-rotate-21 {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes draw-21 {
      0% { stroke-dashoffset: 1200; fill-opacity: 0; }
      50% { stroke-dashoffset: 0; fill-opacity: 0; }
      80%, 100% { stroke-dashoffset: 0; fill-opacity: 1; }
    }
    .anim-21-ring {
      transform-origin: 256px 256px;
      animation: orbit-rotate-21 2.5s infinite linear;
    }
    .anim-21-path {
      stroke: white;
      stroke-width: 8;
      stroke-dasharray: 1200;
      stroke-dashoffset: 1200;
      animation: draw-21 3.5s infinite ease-in-out;
    }
  </style>
  <rect width="512" height="512" rx="120" fill="url(#logo-grad-21)"/>
  <circle class="anim-21-ring" cx="256" cy="256" r="215" stroke="url(#orbit-grad-21)" stroke-width="12" stroke-linecap="round" stroke-dasharray="350 400" fill="none" />
  <path class="anim-21-path" d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" />
  <path class="anim-21-path" d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" transform="translate(20, -20) scale(0.9)" />
</svg>`
  }
]

export default function LogoProposalsPage() {
  const [selectedAnim, setSelectedAnim] = useState<AnimationItem | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('Tous')
  const [gridTheme, setGridTheme] = useState<'dark' | 'light'>('dark')
  
  // Phone simulation states
  const [simRunning, setSimRunning] = useState(true)
  const [simProgress, setSimProgress] = useState(25)
  const [simTheme, setSimTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (selectedAnim && simRunning) {
      interval = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 100) return 0
          return prev + 1.5
        })
      }, 50)
    }
    return () => clearInterval(interval)
  }, [selectedAnim, simRunning])

  const copyToClipboard = (anim: AnimationItem) => {
    navigator.clipboard.writeText(anim.svgCode)
    setCopiedId(anim.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredAnimations = filterCategory === 'Tous'
    ? ANIMATIONS
    : ANIMATIONS.filter(a => a.category === filterCategory)

  return (
    <div className="fixed inset-0 overflow-y-auto bg-zinc-950 text-white font-sans selection:bg-pink-500 selection:text-white pb-24">
      {/* Background radial overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-pink-500/10 via-transparent to-transparent blur-[120px] pointer-events-none z-0" />

      {/* Header Container */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-8 border-b border-zinc-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="size-3.5" /> Direction Artistique
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Galerie des Animations du Logo
            </h1>
            <p className="text-zinc-400 mt-2 max-w-2xl text-sm md:text-base leading-relaxed">
              Sélectionnez et testez en direct 20 propositions d&apos;animations SVG fluides, prêtes pour l&apos;intégration dans l&apos;écran de chargement (Splash Screen) de l&apos;application mobile.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setGridTheme(gridTheme === 'dark' ? 'light' : 'dark')}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-semibold transition-all flex items-center gap-2 active:scale-95"
            >
              Fonds de grille : <span className="text-pink-400 uppercase font-bold">{gridTheme === 'dark' ? 'Sombre ⬛' : 'Clair ⬜'}</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-none">
          {['Tous', 'Élégant', 'Dynamique', 'Premium', 'Ludique'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterCategory === cat 
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/15'
                  : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="text-xs text-zinc-500 ml-auto pl-4">
            Affichage de {filteredAnimations.length} propositions
          </span>
        </div>
      </header>

      {/* Grid of Animations */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimations.map((anim) => (
            <div 
              key={anim.id} 
              className="group flex flex-col rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md overflow-hidden hover:border-zinc-700/60 hover:shadow-xl hover:shadow-black/20 transition-all duration-300"
            >
              {/* Preview Container */}
              <div 
                className={`relative aspect-square flex items-center justify-center p-12 transition-colors ${
                  gridTheme === 'dark' 
                    ? 'bg-zinc-950/80 border-b border-zinc-800/60' 
                    : 'bg-zinc-100 border-b border-zinc-200'
                }`}
              >
                {/* SVG render container */}
                <div 
                  className="w-36 h-36 drop-shadow-2xl"
                  dangerouslySetInnerHTML={{ __html: anim.svgCode }}
                />

                {/* Badges */}
                <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-700/50 backdrop-blur-sm">
                  Catégorie : {anim.category}
                </span>
              </div>

              {/* Text Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">
                    {anim.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed min-h-[40px]">
                    {anim.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 mt-5">
                  <button
                    onClick={() => {
                      setSelectedAnim(anim)
                      setSimProgress(25)
                    }}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500 hover:text-white text-xs font-bold text-pink-400 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Smartphone className="size-3.5" />
                    Tester sur mobile
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(anim)}
                    className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center justify-center active:scale-95"
                    title="Copier le code SVG"
                  >
                    {copiedId === anim.id ? (
                      <Check className="size-4 text-green-400" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Mobile Device Preview Drawer/Modal */}
      {selectedAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div 
            className="absolute inset-0" 
            onClick={() => setSelectedAnim(null)} 
          />
          
          <div className="relative w-full max-w-4xl bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[90vh]">
            {/* Left side: simulated device */}
            <div className="flex-1 bg-zinc-950 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800">
              <div className="text-zinc-500 text-xs font-semibold mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="size-4" /> Simulation iPhone SE (375x667px)
              </div>
              
              {/* iPhone SE Frame */}
              <div className="relative w-[320px] h-[520px] rounded-[40px] border-4 border-zinc-700 bg-black shadow-2xl p-3 flex flex-col overflow-hidden">
                {/* Speaker + Camera */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-20 flex items-center justify-center">
                  <div className="w-10 h-1 bg-zinc-800 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full ml-3" />
                </div>
                
                {/* Simulated Screen */}
                <div 
                  className={`flex-1 rounded-[30px] overflow-hidden flex flex-col items-center justify-between p-8 relative transition-colors ${
                    simTheme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-950'
                  }`}
                >
                  {/* Status Bar */}
                  <div className="w-full flex justify-between items-center text-[10px] font-bold opacity-60">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>LTE</span>
                      <div className="w-5 h-2.5 border border-current rounded-sm p-[1px] flex items-center">
                        <div className="h-full w-4 bg-current rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Centered Loading Animation */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full mt-4">
                    {/* SVG logo */}
                    <div 
                      className="w-32 h-32 drop-shadow-2xl"
                      dangerouslySetInnerHTML={{ __html: selectedAnim.svgCode }}
                    />
                    
                    {/* Brand name */}
                    <div className="flex flex-col items-center text-center">
                      <span className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                        Fonelove
                      </span>
                      <span className={`text-[10px] font-medium tracking-widest uppercase opacity-40 mt-1 ${
                        simTheme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                      }`}>
                        L&apos;amour au bout du fil
                      </span>
                    </div>
                  </div>

                  {/* Loading Progress */}
                  <div className="w-full flex flex-col items-center gap-3">
                    {/* Progress Bar */}
                    <div className={`w-3/4 h-1 rounded-full overflow-hidden ${
                      simTheme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'
                    }`}>
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-orange-500 transition-all duration-75"
                        style={{ width: `${simProgress}%` }}
                      />
                    </div>
                    
                    {/* Status message */}
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                      {simProgress < 40 ? "Initialisation..." : simProgress < 75 ? "Connexion sécurisée..." : "Chargement du profil..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: settings and export */}
            <div className="w-full md:w-[360px] p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-wider bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                    Proposition {selectedAnim.id}
                  </span>
                  <button 
                    onClick={() => setSelectedAnim(null)}
                    className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                
                <h2 className="text-lg font-bold text-white mt-4">{selectedAnim.name}</h2>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{selectedAnim.description}</p>
                
                {/* Control Panel */}
                <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Contrôles de Simulation</h4>
                  
                  {/* Theme toggler */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Fond de l&apos;application :</span>
                    <div className="flex rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 p-0.5">
                      <button 
                        onClick={() => setSimTheme('dark')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                          simTheme === 'dark' ? 'bg-pink-500 text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Sombre
                      </button>
                      <button 
                        onClick={() => setSimTheme('light')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                          simTheme === 'light' ? 'bg-pink-500 text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Clair
                      </button>
                    </div>
                  </div>

                  {/* Loading controller */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Simuler le chargement :</span>
                    <button 
                      onClick={() => setSimRunning(!simRunning)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                        simRunning 
                          ? 'border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10' 
                          : 'border-green-500/20 text-green-400 bg-green-500/5 hover:bg-green-500/10'
                      }`}
                    >
                      {simRunning ? 'Mettre en pause' : 'Relancer'}
                    </button>
                  </div>
                </div>

                {/* Tech Integration Info */}
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Informations d&apos;Intégration</h4>
                  <ul className="text-zinc-400 text-[11px] leading-relaxed flex flex-col gap-2">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 font-bold">•</span>
                      <span><strong>Format :</strong> SVG vectoriel pur, léger (environ 2.5 Ko), s&apos;adapte à toutes les résolutions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 font-bold">•</span>
                      <span><strong>Performance :</strong> Les animations CSS internes n&apos;utilisent aucun script JS ni ressources CPU lourdes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 font-bold">•</span>
                      <span><strong>Compatibilité :</strong> S&apos;intègre directement dans le code Next.js ou comme image statique dans les WebView iOS / Android.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Big CTA */}
              <div className="mt-8 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => copyToClipboard(selectedAnim)}
                  className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/15"
                >
                  <Code className="size-4" />
                  {copiedId === selectedAnim.id ? 'Code SVG copié !' : 'Copier le code source SVG'}
                </button>
                <p className="text-[9px] text-zinc-500 text-center mt-2.5">
                  Le code copié contient l&apos;ensemble des styles CSS @keyframes internes pour un fonctionnement autonome immédiat.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
