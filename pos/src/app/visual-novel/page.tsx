"use client"

import { useState, useEffect } from "react"
import { 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Smartphone, 
  User, 
  Search,
  DollarSign,
  Receipt,
  BarChart3,
  Users,
  FileText,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Zap,
  Store,
  TrendingUp,
  Clock,
  Star
} from "lucide-react"

interface Scene {
  id: number
  title: string
  character: string
  characterRole: string
  dialogue: string
  choices?: Array<{
    text: string
    nextScene: number
    icon?: any
  }>
  background?: string
  action?: string
}

const scenes: Scene[] = [
  {
    id: 0,
    title: "Opening Shift",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "Good morning! Welcome to your first day at Letscase POS. I'll guide you through our system. Ready to start your training?",
    choices: [
      { text: "Yes, I'm excited to learn!", nextScene: 1, icon: Star },
      { text: "I'm a bit nervous...", nextScene: 2, icon: User }
    ],
    background: "bg-gradient-to-br from-blue-50 to-purple-50"
  },
  {
    id: 1,
    title: "The Dashboard",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "Perfect! This is your main dashboard. On the left, you'll see our product catalog with real-time inventory. On the right, the shopping cart. The search bar at the top lets you find products instantly.",
    action: "The screen lights up with a clean, dark interface. Products glow as you hover over them.",
    background: "bg-gradient-to-br from-purple-50 to-pink-50"
  },
  {
    id: 2,
    title: "Don't Worry",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "That's completely normal! Our POS is designed to be intuitive. Let's take it step by step. First, let's look at how customers flow through our system.",
    action: "Sarah points to the customer section with a warm smile.",
    background: "bg-gradient-to-br from-green-50 to-blue-50"
  },
  {
    id: 3,
    title: "Product Magic",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "Watch this! Each product card shows the item name, variant details, price, and stock level. Green means in stock, yellow means low stock, and red means out of stock. No more selling items we don't have!",
    action: "A product card pulses with inventory information. Price displays in beautiful GHS format.",
    background: "bg-gradient-to-br from-amber-50 to-orange-50"
  },
  {
    id: 4,
    title: "Smart Search",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "Try searching for 'phone case' or scan a barcode. Our search is instant and smart. It even handles multiple variants - see how each color shows as its own card?",
    action: "The search bar glows as products filter in real-time. Barcode scanner beeps successfully.",
    background: "bg-gradient-to-br from-indigo-50 to-purple-50"
  },
  {
    id: 5,
    title: "Building the Sale",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "Great! Now watch the cart update automatically. Each item shows quantity, price, and subtotal. You can adjust quantities, add discounts, or even attach customer profiles.",
    action: "Cart items animate in with smooth transitions. Total calculates instantly.",
    background: "bg-gradient-to-br from-emerald-50 to-teal-50"
  },
  {
    id: 6,
    title: "Payment Options",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "Here's where it gets exciting! We accept three payment methods: Cash (with automatic change calculation), Mobile Money via Paystack, and Telecel Agent tracking. Each method has its own streamlined flow.",
    choices: [
      { text: "Show me Cash payment", nextScene: 7, icon: DollarSign },
      { text: "Show me Mobile Money", nextScene: 8, icon: Smartphone },
      { text: "Show me Telecel Agent", nextScene: 9, icon: CreditCard }
    ],
    background: "bg-gradient-to-br from-violet-50 to-indigo-50"
  },
  {
    id: 7,
    title: "Cash Payment",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "For cash, just type the amount received. The system automatically calculates change. Quick amount buttons help with common transactions. No more math errors!",
    action: "Cash amount field accepts decimal input smoothly. Change displays in green.",
    background: "bg-gradient-to-br from-green-50 to-emerald-50"
  },
  {
    id: 8,
    title: "Mobile Money",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "Mobile Money is fully integrated! Select the provider (MTN, Telecel, AirtelTigo), enter the phone number, and Paystack handles the rest. We poll for authorization automatically.",
    action: "Mobile money providers appear as buttons. Phone number field validates in real-time.",
    background: "bg-gradient-to-br from-blue-50 to-cyan-50"
  },
  {
    id: 9,
    title: "Telecel Agent",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "For Telecel Agent transactions, we track agent code, phone, and transaction reference. Everything gets recorded in the order metadata for perfect audit trails.",
    action: "Agent fields appear with validation. Reference number saves with the order.",
    background: "bg-gradient-to-br from-purple-50 to-pink-50"
  },
  {
    id: 10,
    title: "Receipt Magic",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "After payment, the receipt generates automatically! It includes all items, payment details, staff info, and even a QR code. One-click printing or save as PDF.",
    action: "Beautiful receipt template appears with professional formatting.",
    background: "bg-gradient-to-br from-yellow-50 to-amber-50"
  },
  {
    id: 11,
    title: "Customer Management",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "See how we can attach customers to sales? Search by name, email, or phone. Create new customers on the fly. Perfect for loyalty programs and repeat business.",
    action: "Customer search modal appears with create option.",
    background: "bg-gradient-to-br from-rose-50 to-pink-50"
  },
  {
    id: 12,
    title: "Reports & Analytics",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "The reports page is your business intelligence center! Sales trends, top products, staff performance, payment breakdowns. Everything updates in real-time with beautiful charts.",
    action: "Dashboard shows animated charts and KPI cards.",
    background: "bg-gradient-to-br from-cyan-50 to-blue-50"
  },
  {
    id: 13,
    title: "Audit Trail",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "Every action is logged! Sales, refunds, discounts, staff changes. Complete audit trail for accountability and business insights. Filter by date, staff, or action type.",
    action: "Audit log shows detailed timeline of all activities.",
    background: "bg-gradient-to-br from-gray-50 to-slate-50"
  },
  {
    id: 14,
    title: "Staff Management",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "Manage your team right here! Invite staff members, assign roles (Admin, Manager, Cashier), and set PIN codes for quick login. Role-based access keeps everything secure.",
    action: "Staff management interface shows role permissions.",
    background: "bg-gradient-to-br from-indigo-50 to-blue-50"
  },
  {
    id: 15,
    title: "Shift Reports",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "At shift end, generate detailed reports! Cash drawer reconciliation, sales summary, top transactions, and staff performance. Perfect for handovers and daily closing.",
    action: "Shift report shows comprehensive closing summary.",
    background: "bg-gradient-to-br from-teal-50 to-green-50"
  },
  {
    id: 16,
    title: "Refunds Made Easy",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "Need to process a refund? Simply search by order ID, verify the details, and process the refund. Everything is tracked and the inventory updates automatically.",
    action: "Refund interface shows order lookup and processing flow.",
    background: "bg-gradient-to-br from-orange-50 to-red-50"
  },
  {
    id: 17,
    title: "Mobile Experience",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "The POS is fully responsive! Use it on tablets, phones, or desktop. The mobile bottom navigation provides quick access to all features. Perfect for pop-up stores or mobile sales.",
    action: "Interface adapts to mobile view with bottom navigation.",
    background: "bg-gradient-to-br from-purple-50 to-indigo-50"
  },
  {
    id: 18,
    title: "Advanced Features",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "We've got power features! Hold sales for later, quick barcode scanning, keyboard shortcuts, bulk discounts, and real-time inventory sync. The system grows with your business.",
    action: "Advanced features panel shows all capabilities.",
    background: "bg-gradient-to-br from-violet-50 to-purple-50"
  },
  {
    id: 19,
    title: "Your Turn!",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "You've seen it all! The Letscase POS is designed to be beautiful, powerful, and intuitive. Every feature is crafted to make retail management effortless. Ready to start selling?",
    choices: [
      { text: "I'm ready! Let's start selling!", nextScene: 20, icon: Zap },
      { text: "Can I see the reports again?", nextScene: 12, icon: BarChart3 },
      { text: "Show me mobile view once more", nextScene: 17, icon: Smartphone }
    ],
    background: "bg-gradient-to-br from-yellow-50 to-orange-50"
  },
  {
    id: 20,
    title: "Success!",
    character: "Sarah",
    characterRole: "Store Manager",
    dialogue: "Excellent! Welcome to the Letscase family. Your POS is ready, your team is trained, and your customers will love the smooth experience. Let's make today amazing!",
    action: "Confetti animation. The POS dashboard gleams, ready for business.",
    background: "bg-gradient-to-br from-green-50 via-blue-50 to-purple-50"
  }
]

export default function VisualNovelPage() {
  const [currentScene, setCurrentScene] = useState(0)
  const [history, setHistory] = useState<number[]>([])
  const [showTyping, setShowTyping] = useState(true)
  const [displayedText, setDisplayedText] = useState("")
  
  const scene = scenes.find(s => s.id === currentScene) || scenes[0]
  
  // Typing effect
  useEffect(() => {
    setShowTyping(true)
    setDisplayedText("")
    const text = scene.dialogue
    let index = 0
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setShowTyping(false)
        clearInterval(timer)
      }
    }, 30)
    
    return () => clearInterval(timer)
  }, [currentScene, scene.dialogue])
  
  const handleChoice = (nextScene: number) => {
    setHistory([...history, currentScene])
    setCurrentScene(nextScene)
  }
  
  const goBack = () => {
    if (history.length > 0) {
      const newHistory = [...history]
      const previousScene = newHistory.pop()!
      setHistory(newHistory)
      setCurrentScene(previousScene)
    }
  }
  
  const restart = () => {
    setCurrentScene(0)
    setHistory([])
  }
  
  return (
    <div className={`min-h-screen ${scene.background} transition-all duration-1000`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Letscase POS Visual Novel
          </h1>
          <p className="text-gray-600">An Interactive Journey Through Your Point of Sale System</p>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goBack}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              Scene {scene.id + 1} of {scenes.length}
            </span>
            <span className="px-3 py-1 border border-gray-300 text-gray-600 rounded-full text-sm">
              {scene.title}
            </span>
          </div>
          
          <button
            onClick={restart}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
        
        {/* Main Scene */}
        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Character Section */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{scene.character}</h2>
                <p className="text-purple-100">{scene.characterRole}</p>
              </div>
            </div>
          </div>
          
          {/* Dialogue Section */}
          <div className="p-6 bg-white">
            <div className="min-h-[120px]">
              <p className="text-lg leading-relaxed mb-4">
                {displayedText}
                {showTyping && <span className="animate-pulse">|</span>}
              </p>
              {scene.action && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 italic">
                    <span className="font-semibold">✨ {scene.action}</span>
                  </p>
                </div>
              )}
            </div>
            
            {/* Choices */}
            {scene.choices && !showTyping && (
              <div className="mt-6 space-y-3">
                <div className="border-t border-gray-200 pt-4 mb-4" />
                <p className="text-sm text-gray-600 mb-3">What would you like to do?</p>
                {scene.choices.map((choice, index) => {
                  const Icon = choice.icon
                  return (
                    <button
                      key={index}
                      onClick={() => handleChoice(choice.nextScene)}
                      className="w-full justify-start h-auto p-4 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 border border-gray-300 rounded-lg bg-white flex items-center gap-3"
                    >
                      {Icon && <Icon className="w-5 h-5 text-purple-600" />}
                      <span className="text-base">{choice.text}</span>
                      <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
            <Package className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-xs font-medium">Smart Inventory</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
            <Smartphone className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-xs font-medium">Mobile Payments</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-xs font-medium">Real-time Analytics</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <p className="text-xs font-medium">Customer Management</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
