import { html } from '/vendor/lit-html/lit-html.js';

export function UpdateBanner({ onReload }) {
  return html`
    <div class="update-banner">
      <span class="update-banner__message">A new version of Projector is available.</span>
      <button class="update-banner__reload-btn" @click=${onReload}>Reload</button>
    </div>
  `;
}
