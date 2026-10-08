"use server";

import nodemailer from "nodemailer";
import type { ActionResult } from "@/lib/action-result";
import { getClientIp } from "@/lib/auth/session";
import { getServerEnv } from "@/lib/env";
import { CONTACT_TOPICS, contactSchema } from "./schema";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_MESSAGES_PER_WINDOW = 3;

// Per server instance, which is enough to stop one visitor from flooding the
// inbox. It is not a substitute for a shared limiter at higher volumes.
const recentByIp = new Map<string, number[]>();

const isRateLimited = (ip: string) => {
  const now = Date.now();
  const recent = (recentByIp.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_MESSAGES_PER_WINDOW) {
    recentByIp.set(ip, recent);

    return true;
  }

  recentByIp.set(ip, [...recent, now]);

  return false;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** Emails a contact-form message to the support inbox. */
export async function sendContactMessage(input: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the form and try again.",
      fieldErrors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  const { name, email, topic, message, website } = parsed.data;

  // A filled honeypot is a bot: report success and send nothing.
  if (website) {
    return { ok: true };
  }

  if (isRateLimited((await getClientIp()) ?? "unknown")) {
    return {
      ok: false,
      message: "You have sent several messages in a short time. Please try again later.",
    };
  }

  const { SMTP_USER, SMTP_PASSWORD, CONTACT_INBOX } = getServerEnv();

  if (!SMTP_USER || !SMTP_PASSWORD || !CONTACT_INBOX) {
    return {
      ok: false,
      message: "Messaging is not set up on this deployment yet. Please try again later.",
    };
  }

  const topicLabel = CONTACT_TOPICS.find(({ value }) => value === topic)?.label ?? topic;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      connectionTimeout: 8000,
      socketTimeout: 10_000,
    });

    await transporter.sendMail({
      from: `"Enerza contact form" <${SMTP_USER}>`,
      to: CONTACT_INBOX,
      replyTo: `"${name.replaceAll('"', "")}" <${email}>`,
      subject: `[Enerza] ${topicLabel} — ${name}`,
      text: `From: ${name} <${email}>\nTopic: ${topicLabel}\n\n${message}`,
      html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;<br><strong>Topic:</strong> ${escapeHtml(topicLabel)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
  } catch {
    return {
      ok: false,
      message: "Your message could not be sent right now. Please try again in a few minutes.",
    };
  }

  return { ok: true, message: "Message sent. We will reply to your email address." };
}
