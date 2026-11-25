export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

const escape = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function layout(heading: string, body: string, cta?: { label: string; url: string }): string {
  const button = cta
    ? `<p style="margin:28px 0"><a href="${escape(cta.url)}" style="background:#635BFF;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;display:inline-block">${escape(cta.label)}</a></p>
       <p style="color:#737373;font-size:13px">Or paste this link into your browser:<br><span style="word-break:break-all">${escape(cta.url)}</span></p>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#FAFAFA;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#171717">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E5E5E5;border-radius:12px;padding:32px">
  <tr><td><p style="font-weight:600;margin:0 0 24px">Backend Academy</p>
  <h1 style="font-size:20px;margin:0 0 12px">${escape(heading)}</h1>
  <div style="font-size:15px;line-height:1.6">${body}</div>${button}
  </td></tr></table></td></tr></table></body></html>`;
}

export function verificationEmail(name: string, url: string): EmailContent {
  return {
    subject: 'Verify your email address',
    text: `Hi ${name},\n\nConfirm your email to activate your Backend Academy account:\n${url}\n\nThis link expires in 24 hours. If you didn't sign up, ignore this email.`,
    html: layout(
      'Verify your email address',
      `<p>Hi ${escape(name)},</p><p>Confirm your email to activate your Backend Academy account. This link expires in 24 hours.</p><p style="color:#737373">If you didn't sign up, you can ignore this email.</p>`,
      { label: 'Verify email', url },
    ),
  };
}

export function passwordResetEmail(name: string, url: string): EmailContent {
  return {
    subject: 'Reset your password',
    text: `Hi ${name},\n\nUse this link to choose a new password:\n${url}\n\nThis link expires in 30 minutes and can be used once. If you didn't request a reset, ignore this email.`,
    html: layout(
      'Reset your password',
      `<p>Hi ${escape(name)},</p><p>Use the button below to choose a new password. The link expires in 30 minutes and can be used once.</p><p style="color:#737373">If you didn't request a reset, you can ignore this email. Your password won't change.</p>`,
      { label: 'Choose a new password', url },
    ),
  };
}

export function accountExistsEmail(name: string, loginUrl: string): EmailContent {
  return {
    subject: 'You already have an account',
    text: `Hi ${name},\n\nSomeone tried to create a Backend Academy account with this email, but one already exists. Sign in here: ${loginUrl}\n\nForgot your password? Use "Forgot password" on the sign-in page.`,
    html: layout(
      'You already have an account',
      `<p>Hi ${escape(name)},</p><p>Someone tried to create a Backend Academy account with this email address, but one already exists.</p><p>If that was you, sign in instead. If you've forgotten your password, use “Forgot password” on the sign-in page.</p>`,
      { label: 'Sign in', url: loginUrl },
    ),
  };
}
