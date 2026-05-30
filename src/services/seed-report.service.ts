import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SeedReportService {
  // The Cloudflare Worker URL that proxies to our OCI server
  private _apiUrl = 'https://z3r-proxy.derpaholicrex.workers.dev/api/report-seed';

  /**
   * Submit a seed report with the user's description.
   * @param seedHash - The seed hash/data from config.data
   * @param description - The user's description of the issue
   * @param seedData - Optional additional seed metadata
   */
  submitReport(seedHash: string, description: string, seedData?: string): Promise<{ success: boolean; message: string }> {
    return fetch(this._apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seedHash: seedHash,
        description: description,
        seedData: seedData || ''
      })
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.error || 'Failed to submit report');
        });
      }
      return response.json();
    });
  }
}