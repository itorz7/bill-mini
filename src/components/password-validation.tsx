"use client";

import { Check, X } from "lucide-react";

interface PasswordValidationProps {
  password: string;
  confirmPassword?: string;
  showConfirmValidation?: boolean;
}

export function PasswordValidation({ 
  password, 
  confirmPassword, 
  showConfirmValidation = false 
}: PasswordValidationProps) {
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const passwordStrength = Object.values(passwordValidation).filter(Boolean).length;
  
  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-orange-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "อ่อนแอ";
    if (passwordStrength <= 2) return "ปานกลาง";
    if (passwordStrength <= 3) return "แข็งแกร่ง";
    return "แข็งแกร่งมาก";
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const showPasswordMismatch = confirmPassword && password !== confirmPassword;

  if (!password) return null;

  return (
    <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 font-medium">
          ความแข็งแกร่ง
        </span>
        <span
          className={`text-xs font-medium ${
            passwordStrength <= 1
              ? "text-red-400"
              : passwordStrength <= 2
              ? "text-orange-400"
              : passwordStrength <= 3
              ? "text-yellow-400"
              : "text-green-400"
          }`}
        >
          {getStrengthText()}
        </span>
      </div>

      <div className="mb-2">
        <div className="flex space-x-1 h-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`flex-1 rounded-full transition-all duration-300 ${
                level <= passwordStrength
                  ? getStrengthColor()
                  : "bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="flex items-center space-x-1">
          <div
            className={`w-1 h-1 rounded-full ${
              passwordValidation.minLength
                ? "bg-green-400"
                : "bg-gray-600"
            }`}
          />
          <span
            className={
              passwordValidation.minLength
                ? "text-green-400"
                : "text-gray-500"
            }
          >
            8+
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div
            className={`w-1 h-1 rounded-full ${
              passwordValidation.hasUppercase
                ? "bg-green-400"
                : "bg-gray-600"
            }`}
          />
          <span
            className={
              passwordValidation.hasUppercase
                ? "text-green-400"
                : "text-gray-500"
            }
          >
            A-Z
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div
            className={`w-1 h-1 rounded-full ${
              passwordValidation.hasNumber
                ? "bg-green-400"
                : "bg-gray-600"
            }`}
          />
          <span
            className={
              passwordValidation.hasNumber
                ? "text-green-400"
                : "text-gray-500"
            }
          >
            0-9
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div
            className={`w-1 h-1 rounded-full ${
              passwordValidation.hasSpecialChar
                ? "bg-green-400"
                : "bg-gray-600"
            }`}
          />
          <span
            className={
              passwordValidation.hasSpecialChar
                ? "text-green-400"
                : "text-gray-500"
            }
          >
            !@#$
          </span>
        </div>
      </div>

      {showConfirmValidation && confirmPassword && (
        <div className="mt-3 pt-2 border-t border-gray-700">
          {passwordsMatch && (
            <div className="flex items-center text-green-400 text-sm">
              <Check className="h-3 w-3 mr-1" />
              รหัสผ่านตรงกัน
            </div>
          )}
          {showPasswordMismatch && (
            <div className="flex items-center text-red-400 text-sm">
              <X className="h-3 w-3 mr-1" />
              รหัสผ่านไม่ตรงกัน
            </div>
          )}
        </div>
      )}
    </div>
  );
} 