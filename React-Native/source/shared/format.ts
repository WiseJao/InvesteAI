export function formatCPF(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length > 9) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }
    if (digits.length > 6) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }
    if (digits.length > 3) {
        return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    return digits;
}

export type PasswordStrength = {
    level: 0 | 1 | 2 | 3 | 4;
    label: string;
};

export function getPasswordStrength(password: string): PasswordStrength {
    if (!password) return { level: 0, label: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Fraca' };
    if (score === 2) return { level: 2, label: 'Média' };
    if (score === 3) return { level: 3, label: 'Boa' };
    return { level: 4, label: 'Forte' };
}

export function maskEmail(value: string): string {
    const [user, domain] = value.split('@');
    if (!user || !domain) return 'seu e-mail cadastrado';
    return `${user.slice(0, 4)}${'x'.repeat(Math.max(user.length - 4, 0))}@${domain}`;
}
