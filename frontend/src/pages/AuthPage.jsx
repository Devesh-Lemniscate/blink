import React, { useState } from 'react'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 pt-16">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight mb-2">
                        {isLogin ? 'Sign in to Blink' : 'Create your account'}
                    </h1>
                    <p className="text-white/40 text-sm">
                        {isLogin 
                            ? 'Welcome back' 
                            : 'Start shortening URLs today'}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6">
                    {isLogin ? <LoginForm /> : <RegisterForm />}
                </div>

                {/* Toggle */}
                <p className="text-center text-sm text-white/40 mt-6">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-white hover:underline"
                    >
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>
        </div>
    )
}

export default AuthPage