import { Injectable, type OnModuleInit } from '@nestjs/common';
import argon2 from 'argon2';

/** OWASP-recommended Argon2id parameters (m=19 MiB, t=2, p=1). */
const OPTIONS = { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

@Injectable()
export class PasswordService implements OnModuleInit {
  /** Verified against when the user doesn't exist, so login timing doesn't reveal account existence. */
  private dummyHash = '';

  async onModuleInit(): Promise<void> {
    this.dummyHash = await argon2.hash('dummy-password-for-timing', OPTIONS);
  }

  hash(password: string): Promise<string> {
    return argon2.hash(password, OPTIONS);
  }

  async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  async burnTime(password: string): Promise<void> {
    await this.verify(this.dummyHash, password);
  }

  needsRehash(hash: string): boolean {
    return argon2.needsRehash(hash, OPTIONS);
  }
}
