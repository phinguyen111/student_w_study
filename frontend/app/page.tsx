import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import logoImage from '@/components/logo.png'
import { HomeCta } from '@/components/home/HomeCta'
import { LeaderboardSection } from '@/components/home/LeaderboardSection'
import {
  BookOpen,
  Target,
  BarChart3,
  Code,
  Zap,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: BookOpen,
      title: 'Learn by Level',
      description: 'Progress through structured levels from basics to advanced, each step designed to build a solid foundation',
    },
    {
      icon: Target,
      title: 'Interactive Quiz',
      description: 'Test your knowledge with quizzes after each lesson, get instant feedback and continuously improve',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Track your learning streak, time, and achievements with intuitive and detailed dashboards',
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo with Animation */}
            <div className="inline-block mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="relative w-32 h-32 mx-auto">
                <div className="relative w-32 h-32 mx-auto bg-background/80 backdrop-blur-sm rounded-full p-4 shadow-lg border border-border/50">
                  <Image
                    src={logoImage}
                    alt="Code Catalyst Logo"
                    width={96}
                    height={96}
                    className="object-contain w-full h-full"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Main Heading with Code Background */}
            <div className="relative mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              {/* Code Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="code-background-wrapper">
                  <div className="code-background-container">
                    <div className="code-background-text">
                      <span className="code-comment">{'// Welcome to Code Catalyst'}</span>
                      <br />
                      <span className="code-keyword">function</span> <span className="code-function">learn</span><span className="code-punctuation">()</span> <span className="code-punctuation">{'{'}</span>
                      <br />
                      &nbsp;&nbsp;<span className="code-keyword">const</span> <span className="code-variable">skills</span> <span className="code-operator">=</span> <span className="code-punctuation">[</span><span className="code-string">{`'HTML'`}</span><span className="code-punctuation">,</span> <span className="code-string">{`'CSS'`}</span><span className="code-punctuation">,</span> <span className="code-string">{`'JS'`}</span><span className="code-punctuation">]</span><span className="code-punctuation">;</span>
                      <br />
                      &nbsp;&nbsp;<span className="code-keyword">const</span> <span className="code-variable">frameworks</span> <span className="code-operator">=</span> <span className="code-punctuation">[</span><span className="code-string">{`'React'`}</span><span className="code-punctuation">,</span> <span className="code-string">{`'Next.js'`}</span><span className="code-punctuation">]</span><span className="code-punctuation">;</span>
                      <br />
                      <br />
                      &nbsp;&nbsp;<span className="code-keyword">return</span> <span className="code-variable">skills</span><span className="code-punctuation">.</span><span className="code-function">map</span><span className="code-punctuation">(</span><span className="code-variable">skill</span> <span className="code-operator">{'=>'}</span>
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-function">master</span><span className="code-punctuation">(</span><span className="code-variable">skill</span><span className="code-punctuation">)</span>
                      <br />
                      &nbsp;&nbsp;<span className="code-punctuation">)</span><span className="code-punctuation">;</span>
                      <br />
                      <span className="code-punctuation">{'}'}</span>
                      <br />
                      <br />
                      <span className="code-keyword">const</span> <span className="code-variable">catalyst</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-class">CodeCatalyst</span><span className="code-punctuation">()</span><span className="code-punctuation">;</span>
                      <br />
                      <span className="code-variable">catalyst</span><span className="code-punctuation">.</span><span className="code-function">startLearning</span><span className="code-punctuation">()</span><span className="code-punctuation">;</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <h1 className="relative z-10 text-6xl md:text-7xl font-bold">
                <span className="code-catalyst-text cursor-pointer">
                  Code Catalyst
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-2xl md:text-3xl text-muted-foreground mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Master Full Stack Web Development
            </p>
            <p className="text-lg text-muted-foreground/80 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
              Learn HTML, CSS, JavaScript, and modern frameworks through interactive lessons, hands-on coding, and real-world projects
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
              <HomeCta kind="hero" />
            </div>
          </div>
        </div>
      </section>

      <LeaderboardSection />

      {/* Features Section */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="code-catalyst-text cursor-pointer">Code Catalyst</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to become a full-stack developer, all in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index}
                  className="group relative overflow-hidden border border-border/60 bg-card/80 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Accent wash on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground p-3 mb-4 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                      <Icon className="w-full h-full" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-6 h-6 text-primary" />
                <h3 className="text-3xl font-bold">Hands-On Coding</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Practice coding directly in your browser with our integrated code editor. Write, test, and debug code in real-time without leaving the platform.
              </p>
              <ul className="space-y-3">
                {['Live code execution', 'Syntax highlighting', 'Error detection', 'Instant feedback'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-primary" />
                <h3 className="text-3xl font-bold">Learn at Your Pace</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Flexible learning paths that adapt to your schedule. Learn when you want, where you want, at the speed that works for you.
              </p>
              <ul className="space-y-3">
                {['Self-paced courses', 'Progress tracking', 'Learning streaks', 'Achievement badges'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* Final CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto text-center max-w-3xl relative z-10">
          <Award className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey with <span className="code-catalyst-text cursor-pointer">Code Catalyst</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers learning full-stack web development with Code Catalyst
          </p>
          <HomeCta kind="final" />
        </div>
      </section>
    </div>
  )
}