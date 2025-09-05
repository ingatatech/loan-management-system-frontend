// @ts-nocheck

"use client"
import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Shield, Users, Building, TrendingUp, FileText, Lock, CheckCircle, Globe,
  BarChart3, Clock, Award, ArrowRight, Menu, X, ChevronDown, Star, Play, 
  Download, Phone, Mail, MapPin, Database, Settings, Zap, Eye, Target,
  CreditCard, PieChart, DollarSign, Calculator, Server, Workflow, Gauge,
  AlertTriangle, UserCheck, FileCheck, Building2, Banknote, Activity,
  Bell, Calendar, Archive, Send, MessageCircle
} from 'lucide-react'
import Link from 'next/link'

// Floating Particles Background
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 1, 1, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    let start = 0
    const increment = end / (duration / 16)
    function update() {
      start += increment
      if (start < end) {
        setCount(Math.floor(start))
        ref.current = setTimeout(update, 16)
      } else {
        setCount(end)
      }
    }
    update()
    return () => {
      if (ref.current) clearTimeout(ref.current)
    }
  }, [end, duration])

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>
}

// Typing Animation Component
function TypingAnimation({ texts, speed = 100 }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fullText = texts[currentTextIndex]
      
      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1))
        if (currentText === '') {
          setIsDeleting(false)
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1))
        if (currentText === fullText) {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      }
    }, isDeleting ? speed / 2 : speed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentTextIndex, texts, speed])

  return <span className="border-r-2 border-[#5B7FA2] animate-pulse">{currentText}</span>
}

// 3D Tilt Card Component
function TiltCard({ children, delay = 0 }) {
  const ref = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    setRotateY(((x - centerX) / centerX) * 10)
    setRotateX(((centerY - y) / centerY) * 10)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
      className="bg-white/90 backdrop-blur-md rounded-xl p-5 shadow-xl hover:shadow-2xl border border-[#E8F0FE] cursor-pointer"
    >
      {children}
    </motion.div>
  )
}

// Navigation Component
function Navigation({ currentPage, setCurrentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: "home", label: "Home" },
    { href: "features", label: "Features" },
    { href: "solutions", label: "Solutions" },
    { href: "compliance", label: "Compliance" },
    { href: "contact", label: "Contact" },
  ]

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/95 backdrop-blur-md'
    } border-b border-gray-200`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="w-12 h-12 bg-gradient-to-br from-[#5B7FA2] to-[#4A6FA5] rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LoanManager Pro</h1>
              <p className="text-sm text-gray-600">Multi-Tenant Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => setCurrentPage(link.href)}
                className={`text-base font-medium transition-all px-4 py-2 rounded-lg relative ${
                  currentPage === link.href 
                    ? 'text-[#5B7FA2]' 
                    : 'text-gray-700 hover:text-[#5B7FA2]'
                }`}
              >
                {link.label}
                {currentPage === link.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B7FA2]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-base font-medium text-gray-600 hover:text-[#5B7FA2] transition-colors"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="bg-gradient-to-r from-[#5B7FA2] to-[#4A6FA5] text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </Link>
            </motion.div>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gray-200"
          >
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    setCurrentPage(link.href)
                    setIsMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    currentPage === link.href 
                      ? 'bg-[#F0F7FF] text-[#5B7FA2]' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}

// Homepage Component
function HomePage({ setCurrentPage }) {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 150])
  const y2 = useTransform(scrollY, [0, 500], [0, 250])

  const heroTexts = [
    "Multi-Tenant Loan Management",
    "Complete Regulatory Compliance", 
    "Advanced Portfolio Analytics"
  ]

  const trustIndicators = [
    { icon: Shield, text: "Bank-Level Security", color: "text-[#5B7FA2]" },
    { icon: Award, text: "Regulatory Compliant", color: "text-[#5B7FA2]" },
    { icon: Globe, text: "Multi-Region", color: "text-[#5B7FA2]" },
    { icon: Lock, text: "Data Isolation", color: "text-[#5B7FA2]" }
  ]

  const coreFeatures = [
    { 
      icon: Building, 
      title: "Organization Profiles", 
      desc: "Complete organizational control with multi-category services and address management",
      color: "from-[#5B7FA2] to-[#4A6FA5]"
    },
    { 
      icon: Users, 
      title: "Shareholder Management", 
      desc: "Individual and institutional shareholder tracking with KYC documentation",
      color: "from-[#5B7FA2] to-[#4A6FA5]"
    },
    { 
      icon: PieChart, 
      title: "Funding Analytics", 
      desc: "Share capital, borrowing arrangements, and operational funds tracking",
      color: "from-[#5B7FA2] to-[#4A6FA5]"
    },
    { 
      icon: UserCheck, 
      title: "Management Hierarchy", 
      desc: "Board and senior management profiles with qualifications tracking",
      color: "from-[#5B7FA2] to-[#4A6FA5]"
    },
    { 
      icon: Settings, 
      title: "System Administration", 
      desc: "Role-based access control and organization-specific user management",
      color: "from-[#5B7FA2] to-[#4A6FA5]"
    },
    { 
      icon: FileCheck, 
      title: "Compliance Automation", 
      desc: "Automated regulatory compliance with real-time reporting and audits",
      color: "from-[#5B7FA2] to-[#4A6FA5]"
    }
  ]

  const organizationCategories = [
    {
      category: "Category I - Comprehensive",
      services: ["Mortgage Finance", "Development Finance", "Asset Finance", "Money Lending", "Credit Guarantee"],
      color: "border-[#5B7FA2] bg-[#F0F7FF]"
    },
    {
      category: "Category II - Limited Financial", 
      services: ["Asset Finance", "Finance Lease", "Factoring", "Money Lending", "Pawnshop"],
      color: "border-[#5B7FA2] bg-[#F0F7FF]"
    },
    {
      category: "Category III - Support Services",
      services: ["Debt Collection", "Credit Intermediary", "Debt Counsellor", "P2P Lending"],
      color: "border-[#5B7FA2] bg-[#F0F7FF]"
    }
  ]

  const stats = [
    { value: 500, suffix: "+", label: "Organizations" },
    { value: 50, suffix: "K+", label: "Applications" },
    { value: 99.9, suffix: "%", label: "Uptime" },
    { value: 25, suffix: "+", label: "Countries" }
  ]

  return (
    <div className="mt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5B7FA2] via-[#4A6FA5] to-[#3A5F95]" />
        
        {/* Crescent Backgrounds */}
        <motion.div
          className="absolute right-[-10%] top-[20%] w-[60%] h-[80%] opacity-20"
          style={{
            y: y1,
            clipPath: 'ellipse(40% 50% at 100% 50%)',
            background: '#5B7FA2',
            transform: 'rotate(-15deg)'
          }}
        />
        <motion.div
          className="absolute left-[-5%] bottom-[-10%] w-[40%] h-[60%] opacity-15"
          style={{
            y: y2,
            clipPath: 'circle(50% at 0% 100%)',
            background: '#7A9CC6',
            transform: 'rotate(25deg)'
          }}
        />

        <FloatingParticles />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6 shadow-lg">
                  <Zap className="w-4 h-4 mr-2" />
                  Enterprise Financial Platform
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  Streamline Your
                  <br />
                  <span className="text-[#E8F0FE]">
                    <TypingAnimation texts={heroTexts} />
                  </span>
                </h1>
                <p className="text-xl text-[#E8F0FE] mb-8 leading-relaxed">
                  Complete multi-tenant loan management with organization profiling, shareholder tracking, and regulatory compliance automation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-[#5B7FA2] px-8 py-4 rounded-xl hover:bg-gray-50 transition-all font-bold text-lg shadow-2xl"
                >
                  Request Demo
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-[#5B7FA2] transition-all font-bold flex items-center justify-center text-lg backdrop-blur-md"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Brochure
                </motion.button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl"
                  >
                    <div className="text-3xl font-bold text-white">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm text-[#E8F0FE] mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Dashboard Preview</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl border border-white/30">
                      <div className="text-2xl font-bold text-white">156</div>
                      <div className="text-sm text-[#E8F0FE]">Organizations</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl border border-white/30">
                      <div className="text-2xl font-bold text-white">$2.4M</div>
                      <div className="text-sm text-[#E8F0FE]">Funding</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl border border-white/30">
                      <div className="text-2xl font-bold text-white">98.5%</div>
                      <div className="text-sm text-[#E8F0FE]">Compliant</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl border border-white/30">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-white">Portfolio Status</span>
                      <span className="text-sm text-green-300 font-semibold">Active</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '80%' }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="bg-gradient-to-r from-green-400 to-[#5B7FA2] h-3 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,50 Q360,0 720,50 T1440,50 L1440,120 L0,120 Z"
            fill="#F8F9FA"
          />
        </svg>
      </section>

      {/* Trust Indicators */}
      <section className="py-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
            {trustIndicators.map((indicator, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-2"
              >
                <indicator.icon className={`w-5 h-5 ${indicator.color}`} />
                <span className="font-semibold text-gray-700">{indicator.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features with 3D Cards */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8F0FE] rounded-full blur-3xl opacity-30" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Complete loan management ecosystem with multi-tenant architecture and regulatory compliance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <TiltCard key={index} delay={index * 0.1}>
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.desc}</p>
                <button className="text-[#5B7FA2] font-bold hover:text-[#4A6FA5] transition-colors flex items-center group">
                  Learn More 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Organization Categories */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E8F0FE] rounded-full blur-3xl opacity-20" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Service Categories</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Comprehensive service categorization for all financial institution types.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {organizationCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`bg-white rounded-2xl p-8 shadow-xl border-2 ${category.color} hover:shadow-2xl transition-all`}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">{category.category}</h3>
                <div className="space-y-3 mb-6">
                  {category.services.slice(0, 4).map((service, i) => (
                    <div key={i} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#5B7FA2] mr-3 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{service}</span>
                    </div>
                  ))}
                  {category.services.length > 4 && (
                    <div className="text-sm text-gray-500 pl-8">+{category.services.length - 4} more services</div>
                  )}
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#5B7FA2] to-[#4A6FA5] text-white py-4 rounded-xl hover:shadow-lg transition-all font-bold text-lg"
                >
                  Select Category
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Wave Divider */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,50 Q360,100 720,50 T1440,50 L1440,100 L0,100 Z"
            fill="#5B7FA2"
          />
        </svg>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#5B7FA2] to-[#4A6FA5] text-white relative overflow-hidden">
        <FloatingParticles />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-[#E8F0FE] mb-10 max-w-3xl mx-auto text-xl">
              Join 500+ organizations using our platform for secure loan management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#5B7FA2] font-bold px-10 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-2xl text-lg"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white font-bold px-10 py-4 rounded-xl hover:bg-white hover:text-[#5B7FA2] transition-all backdrop-blur-md text-lg"
              >
                Schedule Demo
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,50 Q360,0 720,50 T1440,50 L1440,80 L0,80 Z"
            fill="#ffffff"
          />
        </svg>
      </section>
    </div>
  )
}

// Contact Page Component
function ContactPage({ setCurrentPage }) {
  return (
    <div className="mt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#5B7FA2] to-[#4A6FA5] text-white py-16 relative overflow-hidden">
        <FloatingParticles />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
            <p className="text-[#E8F0FE] text-lg">Get in touch with our expert team</p>
          </motion.div>
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,50 Q360,100 720,50 T1440,50 L1440,60 L0,60 Z"
            fill="#ffffff"
          />
        </svg>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Message</h3>
              <form className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="First Name" 
                    className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7FA2] focus:border-transparent transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Last Name" 
                    className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7FA2] focus:border-transparent transition-all"
                  />
                </div>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7FA2] focus:border-transparent transition-all"
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7FA2] focus:border-transparent transition-all"
                />
                <select className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7FA2] focus:border-transparent transition-all">
                  <option value="">Select Interest</option>
                  <option value="demo">Product Demo</option>
                  <option value="pricing">Pricing Information</option>
                  <option value="implementation">Implementation</option>
                  <option value="support">Technical Support</option>
                </select>
                <textarea 
                  placeholder="Your message..." 
                  rows={5} 
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7FA2] focus:border-transparent transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#5B7FA2] to-[#4A6FA5] text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all flex items-center justify-center text-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-5">
                  {[
                    { icon: Mail, label: "Email", value: "contact@loanmanagerpro.com" },
                    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                    { icon: MapPin, label: "Office", value: "San Francisco, CA" },
                    { icon: Clock, label: "Hours", value: "Mon-Fri: 9AM-6PM PST" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-14 h-14 bg-[#F0F7FF] rounded-xl flex items-center justify-center mr-4">
                        <item.icon className="w-6 h-6 text-[#5B7FA2]" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{item.label}</div>
                        <div className="text-gray-600">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#5B7FA2] to-[#4A6FA5] text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all flex items-center justify-center"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#5B7FA2] to-[#4A6FA5] text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all flex items-center justify-center"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Demo
                </motion.button>
              </motion.div>

              {/* Support Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-2xl p-6 border border-[#E8F0FE]"
              >
                <h4 className="font-bold text-gray-900 mb-4 text-lg">Need Immediate Help?</h4>
                <div className="space-y-3">
                  {[
                    { icon: MessageCircle, text: "Live Chat: Available 24/7" },
                    { icon: Download, text: "Documentation & Guides" },
                    { icon: Award, text: "Enterprise Support Available" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      <item.icon className="w-5 h-5 mr-3 text-[#5B7FA2]" />
                      {item.text}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Main App Component
export default function LoanManagementApp() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />
      case 'contact':
        return <ContactPage setCurrentPage={setCurrentPage} />
      default:
        return <HomePage setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {renderPage()}

      {/* Enhanced Footer with smooth blue */}
      <footer className="bg-gradient-to-br from-[#5B7FA2] to-[#4A6FA5] text-white py-16 relative overflow-hidden">
        <FloatingParticles />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">LoanManager Pro</h1>
                  <p className="text-sm text-[#E8F0FE]">Multi-Tenant Platform</p>
                </div>
              </div>
              <p className="text-[#E8F0FE] leading-relaxed">
                Enterprise loan management with complete compliance automation.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Features</h4>
              <ul className="space-y-2 text-[#E8F0FE]">
                <li className="hover:text-white transition-colors cursor-pointer">Organization Management</li>
                <li className="hover:text-white transition-colors cursor-pointer">Shareholder Tracking</li>
                <li className="hover:text-white transition-colors cursor-pointer">Funding Analytics</li>
                <li className="hover:text-white transition-colors cursor-pointer">Compliance Automation</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Solutions</h4>
              <ul className="space-y-2 text-[#E8F0FE]">
                <li className="hover:text-white transition-colors cursor-pointer">Financial Institutions</li>
                <li className="hover:text-white transition-colors cursor-pointer">Microfinance Organizations</li>
                <li className="hover:text-white transition-colors cursor-pointer">Corporate Lenders</li>
                <li className="hover:text-white transition-colors cursor-pointer">Regulatory Bodies</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Support</h4>
              <ul className="space-y-2 text-[#E8F0FE]">
                <li className="hover:text-white transition-colors cursor-pointer">24/7 Live Chat</li>
                <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-white transition-colors cursor-pointer">Training Resources</li>
                <li className="hover:text-white transition-colors cursor-pointer">Implementation Help</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-[#E8F0FE]">
                © 2025 LoanManager Pro. All rights reserved.
              </p>
              <div className="flex space-x-6 text-[#E8F0FE]">
                <button className="hover:text-white transition-colors font-medium">Privacy</button>
                <button className="hover:text-white transition-colors font-medium">Terms</button>
                <button className="hover:text-white transition-colors font-medium">Security</button>
              </div>
            </div>
          </div>
        </div>


      </footer>

      {/* Floating Contact Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col space-y-4">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentPage('contact')}
          className="w-16 h-16 bg-gradient-to-br from-[#5B7FA2] to-[#4A6FA5] rounded-full flex items-center justify-center shadow-2xl hover:shadow-[#5B7FA2]/50 transition-all"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </motion.button>
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-gradient-to-br from-[#5B7FA2] to-[#4A6FA5] rounded-full flex items-center justify-center shadow-2xl hover:shadow-[#5B7FA2]/50 transition-all"
        >
          <Phone className="w-7 h-7 text-white" />
        </motion.button>
      </div>
    </div>
  )
}