import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, FileCheck, Users, Clock, FileText, Building, Package, Briefcase, FileSearch } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

const useCases = [
  {
    icon: FileText,
    title: 'Intellectual Property Protection',
    description: 'Patent applications, unreleased content, source code, research findings',
    color: 'text-chart-1',
  },
  {
    icon: Building,
    title: 'Financial Compliance & Audit',
    description: 'KYC/AML documents, audit evidence, regulatory reporting',
    color: 'text-chart-2',
  },
  {
    icon: Shield,
    title: 'Government Classified Documents',
    description: 'Inter-agency documents, clearance management, FOIA processing',
    color: 'text-chart-3',
  },
  {
    icon: Package,
    title: 'Supply Chain Security',
    description: 'Pharmaceutical records, food safety, export controls, customs forms',
    color: 'text-chart-4',
  },
  {
    icon: Briefcase,
    title: 'Loan Applications',
    description: 'Loan applications, credit documents, financial statements',
    color: 'text-chart-5',
  },
];

const features = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'AES-256 encryption with client-side key management. Your keys never leave your device.',
  },
  {
    icon: Users,
    title: 'Role-Based Access Control',
    description: 'Granular permissions with Viewer, Editor, and Auditor roles for precise access management.',
  },
  {
    icon: Clock,
    title: 'Time-Limited Access',
    description: 'Grant temporary access for emergency scenarios with automatic expiration.',
  },
  {
    icon: FileCheck,
    title: 'Immutable Audit Trail',
    description: 'NIST/ISO compliant blockchain-backed logging of all document interactions.',
  },
];

export default function Landing() {
  const { wallet, isConfigured } = useWallet();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">SecureVault</span>
          </div>
          <div className="flex items-center gap-4">
            {wallet.connected && (
              <Link href="/dashboard">
                <Button variant="ghost" data-testid="link-dashboard">Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-chart-3/10 py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Shield className="h-4 w-4" />
                NIST/ISO Compliant
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Secure Document Sharing on BlockDAG
              </h1>
              <p className="text-lg text-muted-foreground">
                Enterprise-grade encrypted document storage with blockchain-backed access control. 
                Protect your intellectual property, comply with regulations, and maintain complete audit trails.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={isConfigured && wallet.connected ? "/dashboard" : "/dashboard"}>
                  <Button size="lg" className="gap-2" data-testid="button-get-started">
                    <FileSearch className="h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
                <a href="#use-cases">
                  <Button size="lg" variant="outline" data-testid="button-learn-more">
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-3/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-card border rounded-2xl p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Client-Side Encryption</div>
                    <div className="text-sm text-muted-foreground">AES-256 encryption</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-chart-2/10">
                    <Shield className="h-6 w-6 text-chart-2" />
                  </div>
                  <div>
                    <div className="font-semibold">Blockchain Security</div>
                    <div className="text-sm text-muted-foreground">Immutable records</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-chart-3/10">
                    <Users className="h-6 w-6 text-chart-3" />
                  </div>
                  <div>
                    <div className="font-semibold">Access Control</div>
                    <div className="text-sm text-muted-foreground">Role-based permissions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover-elevate">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Industry Use Cases</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for professionals who need secure, compliant document management across multiple industries
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="hover-elevate" data-testid={`card-use-case-${useCase.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader>
                  <useCase.icon className={`h-10 w-10 ${useCase.color} mb-2`} />
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{useCase.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-6 max-w-4xl text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Secure Your Documents?</h2>
          <p className="text-lg text-muted-foreground">
            Start protecting your sensitive documents with enterprise-grade encryption and blockchain security today.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2" data-testid="button-start-now">
              <Shield className="h-5 w-5" />
              Start Now
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>SecureVault - BlockDAG Document Protection Platform</p>
          <p className="mt-2">NIST/ISO Compliant • End-to-End Encrypted • Blockchain Secured</p>
        </div>
      </footer>
    </div>
  );
}
