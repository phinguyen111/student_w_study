/* eslint-disable @next/next/no-img-element */

'use client'

import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { DynamicCodeEditor } from '@/components/DynamicCodeEditor'
import { Copy, Check, RotateCcw, Play } from 'lucide-react'

export type SupportedLanguage =
	| 'python'
	| 'javascript'
	| 'typescript'
	| 'java'
	| 'cpp'
	| 'c'
	| 'csharp'
	| 'go'
	| 'rust'
	| 'ruby'
	| 'php'
	| 'swift'
	| 'kotlin'
	| 'r'
	| 'sql'
	| 'bash'
	| 'powershell'
	| 'html'
	| 'css'

interface MultiLanguageCodeEditorProps {
	defaultLanguage?: SupportedLanguage
	defaultCode?: string
	onCodeChange?: (code: string) => void
	onLanguageChange?: (language: SupportedLanguage) => void
	showLanguageSelector?: boolean
	readOnly?: boolean
	height?: string
	starterCode?: string
}

const languageLabels: Record<SupportedLanguage, string> = {
	python: 'Python',
	javascript: 'JavaScript',
	typescript: 'TypeScript',
	java: 'Java',
	cpp: 'C++',
	c: 'C',
	csharp: 'C#',
	go: 'Go',
	rust: 'Rust',
	ruby: 'Ruby',
	php: 'PHP',
	swift: 'Swift',
	kotlin: 'Kotlin',
	r: 'R',
	sql: 'SQL',
	bash: 'Bash',
	powershell: 'PowerShell',
	html: 'HTML',
	css: 'CSS',
}

export function MultiLanguageCodeEditor({
	defaultLanguage = 'python',
	defaultCode = '',
	onCodeChange,
	onLanguageChange,
	showLanguageSelector = true,
	readOnly = false,
	height = '400px',
	starterCode,
}: MultiLanguageCodeEditorProps) {
	const [language, setLanguage] = useState<SupportedLanguage>(defaultLanguage)
	const [code, setCode] = useState(defaultCode || starterCode || '')
	const [isRunning, setIsRunning] = useState(false)
	const [output, setOutput] = useState('')
	const [error, setError] = useState('')
	const [copied, setCopied] = useState(false)

	useEffect(() => {
		if (starterCode !== undefined) setCode(starterCode)
	}, [starterCode])

	const languageOptions = useMemo(() => Object.keys(languageLabels) as SupportedLanguage[], [])

	const handleChange = (value: string) => {
		setCode(value)
		onCodeChange?.(value)
	}

	const handleLanguageChange = (value: SupportedLanguage) => {
		setLanguage(value)
		onLanguageChange?.(value)
	}

	const handleReset = () => {
		setCode(starterCode || defaultCode || '')
		setOutput('')
		setError('')
	}

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			// ignore
		}
	}

	const handleRun = async () => {
		setIsRunning(true)
		setOutput('')
		setError('')
		try {
			const res = await api.post('/code/execute', { code, language })
			if (res?.data?.success) {
				setOutput(String(res?.data?.output || ''))
				if (res?.data?.error) setError(String(res?.data?.error))
			} else {
				setError(String(res?.data?.error || 'Execution failed'))
			}
		} catch (e: any) {
			setError(String(e?.response?.data?.error || e?.message || 'Failed to execute code'))
		} finally {
			setIsRunning(false)
		}
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-2 flex-wrap">
				{showLanguageSelector && (
					<select
						value={language}
						onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
						disabled={readOnly}
						className="h-9 rounded-md border bg-background px-3 text-sm"
					>
						{languageOptions.map((id) => (
							<option key={id} value={id}>
								{languageLabels[id]}
							</option>
						))}
					</select>
				)}

				<div className="flex items-center gap-2 ml-auto">
					<Button variant="outline" size="sm" onClick={handleCopy} disabled={readOnly}>
						{copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
						{copied ? 'Copied!' : 'Copy'}
					</Button>
					<Button variant="outline" size="sm" onClick={handleReset} disabled={readOnly}>
						<RotateCcw className="h-4 w-4 mr-2" />
						Reset
					</Button>
					<Button variant="default" size="sm" onClick={handleRun} disabled={isRunning || readOnly}>
						<Play className="h-4 w-4 mr-2" />
						{isRunning ? 'Running...' : 'Run Code'}
					</Button>
				</div>
			</div>

			<DynamicCodeEditor value={code} onChange={handleChange} language={language} height={height} readOnly={readOnly} />

			{(output || error) && (
				<div className="rounded-lg border bg-card p-4">
					{error && <div className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</div>}
					<pre className="text-sm whitespace-pre-wrap break-words">{output}</pre>
				</div>
			)}
		</div>
	)
}

