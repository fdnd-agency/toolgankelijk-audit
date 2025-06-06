<div class="hero">
	<img src="/logoDarkMode.svg" alt="Vervoerregio Amsterdam logo" class="vvr-logo" />
	<h1>Toolgankelijk Audit</h1>
	<p>
		Deze backend-applicatie ondersteunt de partners van <strong>Vervoerregio Amsterdam</strong> bij
		het waarborgen van de toegankelijkheid van hun websites volgens de WCAG-richtlijnen.<br />
		De auditservice biedt drie endpoints die samen het auditproces mogelijk maken:
	</p>
	<div class="features">
		<div class="feature feature-main">
			<h2>Periodieke audit van alle partners</h2>
			<p>
				Met dit endpoint kunnen automatisch alle pagina's van alle partners gecontroleerd worden op
				toegankelijkheid. Dit wordt gebruikt voor periodieke controles, zodat partners inzicht
				houden in de status van hun websites.
			</p>
		</div>
		<div class="feature-side">
			<div class="feature">
				<h2>Audit per partner</h2>
				<p>
					Hiermee kan een gebruiker handmatig een audit starten voor alle pagina's van een
					specifieke partner.
				</p>
			</div>
			<div class="feature">
				<h2>Status-check van de applicatie</h2>
				<p>Met dit endpoint kan gecontroleerd worden of deze backend-applicatie actief is.</p>
			</div>
		</div>
	</div>
	<div class="repo-links">
		<a href="https://github.com/fdnd-agency/toolgankelijk" target="_blank" rel="noopener">
			GitHub: Toolgankelijk
		</a>
		<span> | </span>
		<a href="https://github.com/fdnd-agency/toolgankelijk-audit" target="_blank" rel="noopener">
			GitHub: Toolgankelijk-audit
		</a>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;900&display=swap');
	@import url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');

	:global(body) {
		background: rgb(30, 30, 30);
		font-family: 'Inter', 'Montserrat', Arial, sans-serif;
		color: #fff;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
	}

	.vvr-logo {
		width: 20em;
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 70vh;
		background: linear-gradient(135deg, rgba(38, 41, 48, 0.98) 80%, rgba(181, 0, 108, 0.1) 100%);
		padding: 2.5rem 2rem;
		border-radius: 2rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
		margin: 0 auto;
		max-width: 720px;
		border: 2px solid #b5006c;
		transition:
			box-shadow 0.2s,
			border-color 0.2s;
		font-family: 'Inter', 'Montserrat', Arial, sans-serif;
		color: #fff;
	}

	h1 {
		font-size: 2.7rem;
		font-weight: 900;
		color: #fff;
		margin-bottom: 1.2rem;
		text-align: center;
		letter-spacing: 0.01em;
		text-shadow:
			0 2px 12px #b5006c,
			0 2px 12px #18181b;
		font-family: 'Montserrat', 'Inter', Arial, sans-serif;
	}

	p {
		font-size: 1.25rem;
		color: #fff;
		line-height: 1.7;
		text-align: center;
		margin-bottom: 2rem;
		font-family: 'Inter', 'Montserrat', Arial, sans-serif;
	}

	.features {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		gap: 1.5rem;
		flex-wrap: nowrap;
	}

	.feature-main {
		max-width: 260px;
		height: 24em;
		flex: 0 0 260px;
	}

	.feature-side {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.feature {
		background: #23272e;
		border-radius: 1rem;
		box-shadow: 0 2px 12px rgba(181, 0, 108, 0.1);
		padding: 1.5rem 1.25rem;
		max-width: 260px;
		text-align: center;
		border: 1.5px solid #b5006c;
		transition:
			box-shadow 0.2s,
			border-color 0.2s;
		font-family: 'Inter', 'Montserrat', Arial, sans-serif;
		color: #fff;
	}

	.feature h2 {
		font-size: 1.2rem;
		color: #ffb6e6;
		margin-bottom: 0.5rem;
		font-family: 'Montserrat', 'Inter', Arial, sans-serif;
		text-shadow:
			0 2px 8px #b5006c,
			0 2px 8px #18181b;
		font-weight: 700;
	}

	.feature p {
		font-size: 1rem;
		color: #fff;
		margin: 0;
		font-family: 'Inter', 'Montserrat', Arial, sans-serif;
	}

	.repo-links {
		margin-top: 2.5rem;
		text-align: center;
		font-size: 1rem;
		color: #fff;
	}

	.repo-links a {
		color: #ffb6e6;
		text-decoration: underline;
		margin: 0 0.5em;
		transition: color 0.2s;
	}

	.repo-links a:hover {
		color: #b5006c;
	}

	@media (max-width: 800px) {
		.features {
			flex-direction: column;
			align-items: center;
		}
		.feature-side {
			width: 100%;
		}
	}
</style>
