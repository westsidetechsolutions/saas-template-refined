'use client'

import { useState, useEffect } from 'react'
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
} from '@/lib/password-validation'
import { CheckCircle, XCircle } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
  showRequirements?: boolean
}

export function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
  const [validation, setValidation] = useState(() => validatePassword(password))

  useEffect(() => {
    setValidation(validatePassword(password))
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password Strength</span>
          <span
            className={`font-medium ${getPasswordStrengthColor(validation.strength).split(' ')[0]}`}
          >
            {getPasswordStrengthLabel(validation.strength)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              validation.strength === 'weak'
                ? 'bg-red-500'
                : validation.strength === 'medium'
                  ? 'bg-orange-500'
                  : validation.strength === 'strong'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
            }`}
            style={{ width: `${validation.score}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground">Score: {validation.score}/100</div>
      </div>

      {/* Requirements */}
      {showRequirements && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Requirements:</p>
          <div className="space-y-1">
            {validation.requirements.minLength ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>At least 12 characters</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                <span>At least 12 characters</span>
              </div>
            )}

            {validation.requirements.hasUppercase ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>One uppercase letter</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                <span>One uppercase letter</span>
              </div>
            )}

            {validation.requirements.hasLowercase ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>One lowercase letter</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                <span>One lowercase letter</span>
              </div>
            )}

            {validation.requirements.hasNumber ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>One number</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                <span>One number</span>
              </div>
            )}

            {validation.requirements.hasSpecialChar ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>One special character</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                <span>One special character</span>
              </div>
            )}

            {validation.requirements.noCommonPatterns ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>No common patterns</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                <span>No common patterns</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
