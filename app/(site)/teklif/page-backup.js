"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Beaker,
  Pill,
  Sparkles,
  FileText,
  Upload,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuoteSubmission } from "@/hooks/use-quote-submission";
import {
  SubmissionSuccess,
  SubmissionError,
  SubmissionLoading,
} from "@/components/submission-status";
import {
  OrganizationSchema,
  LocalBusinessSchema,
} from "@/components/structured-data";
