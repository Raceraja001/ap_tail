import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockFormData } from '../../test/utils';
import SignInForm from './SignInForm';

/**
 * SignInForm Component Tests
 * 
 * Tests authentication form functionality, validation, and user interactions.
 * Implements comprehensive testing patterns for form components.
 */

// Mock react-router hooks
const mockNavigate = vi.fn();
const mockLocation = { state: { from: { pathname: '/' } } };

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

describe('SignInForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign in form with all required fields', () => {
    renderWithProviders(<SignInForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /keep me logged in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(<SignInForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    renderWithProviders(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    renderWithProviders(<SignInForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('submits form with valid credentials', async () => {
    const mockAuthService = {
      login: vi.fn().mockResolvedValue({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        tokens: { accessToken: 'token', refreshToken: 'refresh', expiresAt: Date.now() + 3600000 },
      }),
    };

    renderWithProviders(<SignInForm />, { authService: mockAuthService });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, mockFormData.signIn.email);
    await user.type(passwordInput, mockFormData.signIn.password);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: mockFormData.signIn.email,
        password: mockFormData.signIn.password,
        rememberMe: false,
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('handles login error gracefully', async () => {
    const mockAuthService = {
      login: vi.fn().mockRejectedValue({
        code: 'HTTP_401',
        message: 'Invalid credentials',
      }),
    };

    renderWithProviders(<SignInForm />, { authService: mockAuthService });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const mockAuthService = {
      login: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000))),
    };

    renderWithProviders(<SignInForm />, { authService: mockAuthService });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, mockFormData.signIn.email);
    await user.type(passwordInput, mockFormData.signIn.password);
    await user.click(submitButton);

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles remember me checkbox', async () => {
    const mockAuthService = {
      login: vi.fn().mockResolvedValue({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        tokens: { accessToken: 'token', refreshToken: 'refresh', expiresAt: Date.now() + 3600000 },
      }),
    };

    renderWithProviders(<SignInForm />, { authService: mockAuthService });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /keep me logged in/i });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, mockFormData.signIn.email);
    await user.type(passwordInput, mockFormData.signIn.password);
    await user.click(rememberMeCheckbox);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: mockFormData.signIn.email,
        password: mockFormData.signIn.password,
        rememberMe: true,
      });
    });
  });

  it('navigates back to dashboard link', () => {
    renderWithProviders(<SignInForm />);

    const backLink = screen.getByRole('link', { name: /back to dashboard/i });
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });
});
