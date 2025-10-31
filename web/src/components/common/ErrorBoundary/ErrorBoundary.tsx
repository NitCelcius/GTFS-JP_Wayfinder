"use client";

import React from "react";

import { ErrorDialog } from "../ErrorDialog";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  contactEmail?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleClose = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDialog
          isOpen={true}
          onClose={this.handleClose}
          error={this.state.error || undefined}
          contactEmail={this.props.contactEmail}
        />
      );
    }

    return this.props.children;
  }
}
