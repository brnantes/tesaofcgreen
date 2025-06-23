import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  onValueChange?: (numericValue: number) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, onValueChange, className, ...props }, forwardedRef) => {
    const [displayValue, setDisplayValue] = useState('');
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Combina as refs
    React.useImperativeHandle(forwardedRef, () => inputRef.current!);

    // Função para formatar o valor numérico em moeda
    const formatCurrency = (numericValue: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue);
    };

    // Função para extrair apenas números de uma string
    const extractNumbers = (str: string): string => {
      return str.replace(/\D/g, '');
    };

    // Função para converter string de números em valor numérico
    const parseNumericValue = (numbersOnly: string): number => {
      if (!numbersOnly) return 0;
      // Considera os últimos 2 dígitos como centavos
      const cents = parseInt(numbersOnly.slice(-2) || '0', 10);
      const reais = parseInt(numbersOnly.slice(0, -2) || '0', 10);
      return reais + cents / 100;
    };

    // Atualiza o display quando o valor prop muda
    useEffect(() => {
      if (value) {
        const numbers = extractNumbers(value);
        const numericValue = parseNumericValue(numbers);
        setDisplayValue(formatCurrency(numericValue));
      } else {
        setDisplayValue('');
      }
    }, [value]);

    // Restaura a posição do cursor
    useEffect(() => {
      if (cursorPosition !== null && inputRef.current) {
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        setCursorPosition(null);
      }
    }, [cursorPosition, displayValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const currentCursorPos = e.target.selectionStart || 0;
      
      // Extrai apenas números
      const numbers = extractNumbers(inputValue);
      
      if (numbers === '') {
        setDisplayValue('');
        onChange('');
        onValueChange?.(0);
        return;
      }

      // Converte para valor numérico
      const numericValue = parseNumericValue(numbers);
      
      // Formata o valor
      const formatted = formatCurrency(numericValue);
      
      // Calcula a nova posição do cursor
      const oldLength = displayValue.length;
      const newLength = formatted.length;
      const diff = newLength - oldLength;
      
      // Se o usuário está digitando no final, mantém o cursor no final
      if (currentCursorPos >= oldLength) {
        setCursorPosition(newLength);
      } else {
        // Caso contrário, ajusta a posição baseado na diferença
        setCursorPosition(Math.max(0, currentCursorPos + diff));
      }
      
      setDisplayValue(formatted);
      onChange(formatted);
      onValueChange?.(numericValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permite navegação e seleção
      const allowedKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'];
      if (allowedKeys.includes(e.key)) return;
      
      // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
      
      // Permite backspace e delete
      if (['Backspace', 'Delete'].includes(e.key)) return;
      
      // Bloqueia qualquer tecla que não seja número
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    };

    return (
      <Input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn('font-mono', className)}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
