export function formatCPF(value: string): string {
    if (!/^[\d.\-]*$/.test(value)) return value;
    const digits = value.replace(/\D/g, '');

    if (/[.\-]/.test(value)) {
        const formatar = (d: string) => d.length > 9 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
            : d.length > 6 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
                : d.length > 3 ? `${d.slice(0, 3)}.${d.slice(3)}` : d;
        const expected = formatar(digits);
        const digitado = formatar(digits.slice(0, -1)) + digits.slice(-1);
        if (value !== expected && value !== digitado && value !== `${expected}.` && value !== `${expected}-`) return value;
    }

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

export function cpfValido(value: string): boolean {
    if (!/^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(value)) return false;
    const cpf = value.replace(/\D/g, '');
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
    for (let tamanho = 9; tamanho <= 10; tamanho++) {
        const soma = cpf.slice(0, tamanho).split('').reduce((total, digito, i) => total + Number(digito) * (tamanho + 1 - i), 0);
        const resto = soma % 11;
        if (Number(cpf[tamanho]) !== (resto < 2 ? 0 : 11 - resto)) return false;
    }
    return true;
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
