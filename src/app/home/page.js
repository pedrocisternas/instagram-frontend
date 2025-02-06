'use client'
import { useState } from 'react';
import { Card, CardBody, Button, Spinner } from "@heroui/react";
import { generateInsights } from '@/services/api/insights';

export default function HomePage() {

  return (
    <main className="p-8 bg-gray-50">
      <h1>Home</h1>
    </main>
  );
}