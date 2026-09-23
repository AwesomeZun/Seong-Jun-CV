(() => {
const doc = document;
const frame = {contentWindow: window};
const assetRoot = new URL('./', document.currentScript.src).href;
const exportName = document.querySelector('.cv-download')?.getAttribute('href')?.replace(/\.pdf$/, '') || 'Seong-Jun-Kang-CV';
      const style = doc.createElement('style');
      style.textContent = `
        /* Readability proposal: content and hierarchy are unchanged. */
        body { font-size: 16px; line-height: 1.56; }
        .page { width: 100%; max-width: none; padding: 48px 54px; }
        :root { --cv-ui-gap: 16px; --cv-ui-right: max(12px, calc((100vw - 1382px) / 2 + 12px)); }
        .shell { --chat-layout-duration: 680ms; grid-template-columns: minmax(0, 1020px) 320px; gap: var(--cv-ui-gap); max-width: 1382px; margin: 22px auto;
          transition: grid-template-columns var(--chat-layout-duration) cubic-bezier(.4,0,.2,1), gap var(--chat-layout-duration) cubic-bezier(.4,0,.2,1); }
        .shell:has(> .askpane[hidden]), .shell.chat-hidden { grid-template-columns: minmax(0, 1360px) 0; gap: 0; justify-content: stretch; max-width: 1382px; }
        /* The chat remains intentionally smaller than the CV itself. */
        .askpane { position: fixed !important; top: 80px; right: var(--cv-ui-right); z-index: 18; width: 320px;
          max-height: calc(100vh - 92px); margin: 0; padding: 16px; overflow-y: auto;
          transform-origin: top right; will-change: transform, opacity, filter, clip-path;
          box-shadow: 0 10px 32px rgb(25 48 73 / .13); }
        .askpane .ksj-chat { font-size: .78rem; }
        .askpane .ksj-title { font-size: 14px; }
        .askpane .ksj-intro { font-size: 10px; line-height: 1.4; }
        /* A taller composer avoids clipping longer questions. */
        .askpane .ksj-composer { border-radius: 1.35rem; padding: .8rem .9rem .7rem; }
        .askpane .ksj-composer textarea { min-height: 4.5rem; max-height: 9rem; line-height: 1.45; }
        .askpane .ksj-bar { margin-top: .55rem; }
        .askpane .cv-download { display: none; }
        .askpane .cv-others { display: none; }
        .cv-download-toolbar { position: fixed; top: 22px; right: calc(var(--cv-ui-right) + 58px); z-index: 20; display: flex; gap: 10px; }
        .cv-file-action { width: 126px; height: 48px; min-height: 48px; padding: 6px 9px; display: grid; grid-template-columns: 32px minmax(0, 1fr); align-items: center; gap: 7px;
          border: 1px solid #d7e0e9; border-radius: 13px; background: #fff; color: #27496b; box-shadow: 0 4px 12px rgb(30 61 91 / .10);
          font-family: var(--font); text-decoration: none; text-align: left; cursor: pointer; transition: transform .14s, box-shadow .14s, background .14s; }
        .cv-file-action:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgb(30 61 91 / .19); }
        .cv-file-action:hover { background: #f6f9fc; border-color: #9cb4ca; }
        .cv-file-action:active { transform: translateY(0); box-shadow: 0 3px 10px rgb(30 61 91 / .14); }
        .cv-file-action:focus-visible { outline: 3px solid var(--cobalt); outline-offset: 4px; }
        .cv-file-action:disabled { cursor: not-allowed; color: #51677d; background: #f8fafc; }
        .cv-file-action:disabled:hover { transform: none; box-shadow: 0 7px 18px rgb(30 61 91 / .13); }
        .cv-file-format { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; background: #e7f0f8; color: var(--blue);
          font-size: 9px; font-weight: 800; letter-spacing: .25px; }
        .cv-file-copy { display: block; min-width: 0; }
        .cv-file-copy strong { display: block; color: inherit; font-size: 12px; line-height: 1.1; letter-spacing: -.2px; white-space: nowrap; }
        .cv-file-copy small { display: block; margin-top: 3px; color: #7a8998; font-size: 9px; font-weight: 700; line-height: 1; }
        /* The floating button is present in both states; it is the open/close control. */
        .cv-chat-fab { position: fixed; top: 22px; right: var(--cv-ui-right); z-index: 20; width: 48px; height: 48px; padding: 0;
          display: grid; place-items: center; border: 0; background: transparent; cursor: pointer;
          transition: transform .18s; }
        .cv-chat-fab img { display: block; position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); width: 58px; height: 52px; object-fit: contain; filter: drop-shadow(0 3px 3px rgb(15 39 63 / .13)); }
        .cv-chat-switch { position: absolute; right: 2px; bottom: 0; z-index: 2; width: 25px; height: 13px;
          border: 2px solid #fff; border-radius: 999px; background: #aeb8c4; box-shadow: 0 2px 6px rgb(20 44 68 / .24);
          transition: background .2s ease; }
        .cv-chat-switch::before { content: 'OFF'; position: absolute; right: calc(100% + 4px); top: 50%; translate: 0 -50%;
          padding: 2px 4px; border-radius: 5px; background: rgb(255 255 255 / .92); color: #728091;
          font: 800 7px/1 var(--font); letter-spacing: .3px; box-shadow: 0 1px 4px rgb(20 44 68 / .12); }
        .cv-chat-switch::after { content: ''; position: absolute; top: 1px; left: 1px; width: 7px; height: 7px;
          border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgb(20 44 68 / .25); transition: transform .2s ease; }
        .cv-chat-fab[aria-expanded="true"] .cv-chat-switch { background: #2f8f67; }
        .cv-chat-fab[aria-expanded="true"] .cv-chat-switch::before { content: 'ON'; color: #267a59; }
        .cv-chat-fab[aria-expanded="true"] .cv-chat-switch::after { transform: translateX(12px); }
        .cv-chat-fab:hover { transform: translateY(-3px) scale(1.04); }
        .cv-chat-fab:focus-visible { outline: 3px solid #2f5fe0; outline-offset: 4px; }
        .cv-chat-fab[aria-expanded="true"] { animation-play-state: paused; }
        @keyframes cv-chat-bob { 0%, 100% { translate: 0 0; } 50% { translate: 0 -7px; } }
        @media (prefers-reduced-motion: reduce) {
          .shell { --chat-layout-duration: 0ms; }
          .cv-chat-fab { animation: none; transition: none; }
          .cv-chat-switch, .cv-chat-switch::after { transition: none; }
        }
        .cv-others { font-size: 13px; line-height: 1.55; }
        .cv-others b { font-size: 12px; }
        .name { font-size: 38px; }
        .titles { font-size: 15px; line-height: 1.48; }
        .hright { padding-top: 12px; font-size: 13px; line-height: 1.58; }
        .hright .avail { font-size: 12px; }
        .profile { font-size: 14px; line-height: 1.6; }
        .profile .slab, .summary3 .slab, .sublbl { font-size: 12px; }
        .sechdr h2 { font-size: 18px; }
        ol.outputs li, .row .main, ol.pubs li, .publist li { font-size: 14px; line-height: 1.58; }
        ol.outputs .contrib, .pubs .contrib, .publist .contrib { font-size: 12px; line-height: 1.52; }
        .row { grid-template-columns: 165px 1fr; gap: 22px; padding: 8px 0; }
        .row .lab .role { font-size: 14px; }
        .row .lab .dt, .row .lab .mini { font-size: 12px; }
        .mentortable th { font-size: 11px; padding: 9px 10px; }
        .mentortable td { font-size: 12px; line-height: 1.48; padding: 9px 10px; }
        .mentortable col.year { width: 9%; }
        .mentortable col.mentee { width: 19%; }
        .mentortable col.affiliation { width: 39%; }
        .mentortable col.training { width: 33%; }
        .mentortable .myear { white-space: nowrap; overflow-wrap: normal; }
        .mentortable .mname { font-size: 12px; }
        .mentortable .mrole { font-size: 11px; }
        .granttbl { font-size: 13px; }
        .granttbl th, .grantnote, .pubkey { font-size: 11px; }
        .granttbl td { padding: 7px 10px 7px 0; }
        .pubstats .st span, .grouplbl { font-size: 12px; }
        .pubstats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); align-items: stretch; }
        .pubstats .st { min-width: 0; padding: 10px 5px; display: flex; flex-direction: column; justify-content: center; }
        .pubstats .st span { font-size: 10px; letter-spacing: 0; }
        .pubstats .st.total { background: #edf3f8; border-right: 2px solid #b8c9d9; }
        .pubstats .st.total b { font-size: 28px; color: var(--blue); }
        .pubstats .st.total span { font-size: 10px; letter-spacing: .6px; }
        .pubstats .st.authorship { border-left: 2px solid #b8c9d9; background: #f6f7f9; }
        .pubstats .st.authorship b { font-size: 18px; color: var(--iron); }
        .pubstats .st.authorship small { font-size: 8px; line-height: 1.3; color: var(--iron); margin-top: 2px; }
        .authorship-badge { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 9px; margin: 10px 0 12px; font-size: 11px; color: var(--iron); }
        .authorship-badge strong { padding: 4px 9px; border-radius: 6px; background: #eef1f5; color: var(--graphite, #454c57); font-size: 11px; }
        .pdf, .publist .rev { font-size: 10.5px; }
        .publist .rev { display: inline-block; padding: 2px 6px; border: 1px solid #e99b94; border-radius: 5px; background: #fff0ef;
          color: #b42318; font-style: normal; font-weight: 800; line-height: 1.2; }
        .skillrow { grid-template-columns: 165px 1fr; gap: 22px; padding: 8px 0; }
        .skillrow .lab, .skillrow .items, .interest, .inline, .refblk { font-size: 14px; line-height: 1.58; }
        .refblk .rn, .refblk .rnote, .foot { font-size: 12px; }
        #books { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 16px; align-items: center; }
        #books > .sechdr { grid-column: 1 / -1; }
        #books > .publist { min-width: 0; }
        .book-covers { display: flex; gap: 6px; align-items: center; }
        .book-covers img { display: block; height: 118px; width: auto; object-fit: contain; }
        @media (max-width: 680px) { #books { column-gap: 8px; } .book-covers { gap: 2px; } .book-covers img { height: 78px; } }
        @media screen and (max-width: 680px) {
          .sechdr h2 { white-space: normal; min-width: 0; overflow-wrap: anywhere; }
          .skillrow { grid-template-columns: 1fr; gap: 5px; }
          .skillrow .lab { text-align: left; }
          .skillrow .items, .row .main { min-width: 0; overflow-wrap: anywhere; }
          .row { grid-template-columns: 1fr; gap: 5px; }
          .granttbl { display: block; width: 100%; overflow-x: auto; }
          .shell, .shell.chat-hidden, .shell:has(> .askpane[hidden]) { display: block; margin-top: 78px; }
          #books { grid-template-columns: minmax(0,1fr); }
          .book-covers { justify-content: flex-start; }
          .pubstats .st span { font-size: 8px; }
          .pubstats .st.authorship small { font-size: 7px; }
          .page { padding: 28px 20px; }
          .mentortable td { grid-template-columns: 108px 1fr; font-size: 13px; }
          .mentortable td::before { font-size: 11px; }
          .cv-download-toolbar { top: 14px; right: 84px; gap: var(--cv-ui-gap); }
          .askpane { top: 78px; right: 12px; width: calc(100vw - 24px); max-height: calc(100vh - 90px); padding: 16px; }
          .cv-file-action { width: 96px; min-height: 44px; padding: 5px 7px; grid-template-columns: 28px minmax(0, 1fr); gap: 6px; border-radius: 11px; }
          .cv-file-format { width: 29px; height: 29px; font-size: 8px; }
          .cv-file-copy strong { font-size: 10px; }
          .cv-file-copy small { font-size: 8px; }
          .cv-chat-fab { top: 6px; right: 10px; width: 56px; height: 56px; }
          .cv-chat-fab img { width: 40px; height: 40px; }
        }
        @media print {
          .cv-download-toolbar, .cv-chat-fab, .askpane { display: none !important; }
          .shell { display: block !important; margin: 0 !important; padding: 0 !important; }
          .page { padding: 0 !important; }
          #books { break-inside: avoid; }
          body { font-size: 11.5pt; line-height: 1.52; }
          .name { font-size: 29pt; }
          .profile, ol.outputs li, .row .main, ol.pubs li, .publist li, .skillrow .items, .interest, .inline, .refblk { font-size: 11.5pt; }
          .mentortable th { font-size: 10pt; }
          .mentortable td { font-size: 10.25pt; line-height: 1.45; }
          .mentortable .mname { font-size: 10.25pt; }
          .mentortable .mrole, .granttbl th, .grantnote, .pubkey, .pdf, .publist .rev, .foot { font-size: 10pt; }
        }
      `;
      doc.head.append(style);

      const replaceExperience = (role, text) => {
        const row = [...doc.querySelectorAll('.row')].find((item) =>
          item.querySelector('.role')?.textContent.trim() === role
        );
        const detail = row?.querySelector('.main .det');
        if (detail) detail.textContent = text;
      };
      doc.querySelector('.hright .avail')?.remove();
      [...doc.querySelectorAll('.foot span')]
        .find((item) => item.textContent.trim().startsWith('Available from'))
        ?.remove();
      // These are the approved, balanced Keating descriptions. The preview applies
      // them to the general CV before the canonical files are changed after approval.
      replaceExperience(
        'Associate Director',
        'Led anti-CD40 candidate evaluation, including primate studies, external-study coordination, advancement decisions, and single-cell/spatial workflow development.'
      );
      replaceExperience(
        'Manager',
        'Led KDDF-funded anti-CD40 lead-selection work and wrote proposals for multiple-sclerosis and pemphigus-vulgaris programs.'
      );
      replaceExperience(
        'Researcher(postdoctoral)',
        'Contributed to a project examining associations between skin immunity and Alzheimer\'s disease using public transcriptomic and clinical datasets.'
      );
      const scaidExperience = [...doc.querySelectorAll('.row')].find((item) =>
        item.querySelector('.role')?.textContent.trim() === 'Project Contributor' &&
        item.querySelector('.org')?.textContent.includes('SCAID')
      );
      scaidExperience?.remove();
      const transplantExperience = [...doc.querySelectorAll('.row')].find((item) =>
        item.querySelector('.org')?.textContent.includes('Xenotransplantation Research Center')
      );
      const transplantDetail = transplantExperience?.querySelector('.main .det');
      if (transplantDetail) transplantDetail.textContent = 'Rhesus tissue processing and transplant immune monitoring.';
      const militaryService = [...doc.querySelectorAll('.row')].find((item) =>
        item.querySelector('.role')?.textContent.includes('Military Service')
      );
      if (militaryService) {
        militaryService.querySelector('.role').textContent = 'Military Service';
        militaryService.querySelector('.org').textContent = 'Research Personnel, Transplantation Research Institute, Seoul National University MRC';
      }
      const technicalSection = [...doc.querySelectorAll('.sec')].find((section) =>
        section.querySelector('.sechdr h2')?.textContent.trim() === 'Technical Expertise'
      );
      if (technicalSection) {
        const skillRows = [...technicalSection.querySelectorAll('.skillrow')];
        const findSkill = (label) => skillRows.find((row) => row.querySelector('.lab')?.textContent.includes(label));
        const singleCell = findSkill('Single-cell');
        if (singleCell) {
          singleCell.querySelector('.items').innerHTML = 'scRNA-seq, scTCR-seq, snRNA/snATAC; 10x 5′/3′ library generation and <b>10x Chromium Connect</b> automated preparation. Single-cell sequencing data analysis and interpretation in Python and R. Spatial: <b>GeoMx DSP</b> run end to end, <b>Visium</b>, <b>MACSima</b> cyclic multiplexed immunofluorescence.';
        }
        const computational = findSkill('Computational');
        const cellTissue = findSkill('Cell, tissue');
        const microscopy = findSkill('Microscopy');
        const binding = findSkill('Binding');
        const execution = findSkill('Program');
        if (computational) {
          computational.querySelector('.items').innerHTML = '<b>Python, R, Linux, and Git</b>; scikit-learn, XGBoost/LightGBM/CatBoost, and PyTorch. Donor- or case-level validation and multimodal analysis of imaging, transcriptomic, and clinical data.';
        }
        if (binding) {
          binding.querySelector('.items').innerHTML = '<b>Biacore SPR</b> and ELISA for affinity, kinetics, competition binding, receptor blockade, and cross-species comparison; functional validation in primary human T cells.';
        }
        if (execution) {
          execution.querySelector('.lab').innerHTML = 'Study execution &amp;<br>collaboration';
          execution.querySelector('.items').textContent = 'Study design, external-study coordination, multi-site sample QC, milestone tracking, regulatory documentation, and data review.';
        }
        for (const row of [singleCell, computational, cellTissue, microscopy, binding, execution]) {
          if (row) technicalSection.append(row);
        }
      }
      const generalExpertise = doc.querySelectorAll('.interest li')[2];
      if (generalExpertise) {
        generalExpertise.innerHTML = '<b>Wet-lab and translational experiments.</b> Primary-cell culture and DNA/RNA processing; 10x Chromium scRNA-seq and GeoMx DSP spatial workflows; SPR and ELISA binding assays; and Olink proteomics.';
      }
      const multiModalExpertise = doc.querySelectorAll('.interest li')[0];
      if (multiModalExpertise) {
        multiModalExpertise.innerHTML = '<b>Multi-modal cellular measurement.</b> 10x single-cell workflows, end-to-end GeoMx DSP, Visium spatial transcriptomics, MACSima cyclic multiplexed immunofluorescence, high-parameter flow cytometry, and targeted proteomics.';
      }
      const computationalExpertise = doc.querySelectorAll('.interest li')[1];
      if (computationalExpertise) {
        computationalExpertise.innerHTML = '<b>Computational analysis.</b> Sequencing-data analysis in Python and R using statistical and machine-learning tools, multimodal integration, and donor- or case-level evaluation; co-authored an AIDD workflow spanning target discovery, binding prediction, virtual screening, and lead optimization.';
      }
      const programExpertise = doc.querySelectorAll('.interest li')[3];
      if (programExpertise) {
        const animalExpertise = doc.createElement('li');
        animalExpertise.innerHTML = '<b>Animal experiments.</b> EAE and Alzheimer\'s disease models; skin- and islet-transplantation studies; animal breeding and longitudinal immune monitoring.';
        programExpertise.before(animalExpertise);
        programExpertise.innerHTML = '<b>Program and study execution.</b> Multi-site sample QC, non-human-primate studies, and proposal writing and execution for approximately $1.3 million in industry awards.';
      }
      const educationSection = [...doc.querySelectorAll('.sec')].find((section) =>
        section.querySelector('.sechdr h2')?.textContent.trim() === 'Education'
      );
      [...(educationSection?.querySelectorAll(':scope > .sublbl') || [])]
        .find((label) => label.textContent.trim() === 'Degrees')
        ?.remove();
      const firstAuthorLabel = [...doc.querySelectorAll('.sublbl')].find((label) =>
        label.textContent.trim() === 'Publications · First / Co-first Author'
      );
      if (firstAuthorLabel) firstAuthorLabel.textContent = 'First / Co-first Author';
      const preparationLabel = [...doc.querySelectorAll('.sublbl')].find((label) =>
        label.textContent.trim() === 'Manuscripts in Preparation'
      );
      const preparationList = preparationLabel?.nextElementSibling;
      if (preparationList?.classList.contains('publist')) {
        const manuscript = doc.createElement('li');
        manuscript.innerHTML = `<span class="yr">2026</span><span class="ct">Sung Ha Lim*, Jiyeon Oh*, Kyu-Hee Hwang, Taesic Lee, <span class="me">Seong-Jun Kang</span>, Eung Ho Choi, Seung-Kuy Cha. <span class="ttl">"Skin-brain transcriptomic convergence: an integrative framework for predicting Alzheimer's disease from cutaneous aging signatures."</span> <span class="rev">in preparation</span><span class="contrib">Co-author (methodology, single-cell analysis). Built the method that turns a meta-analysis of 8 skin-aging transcriptome datasets into gene sets and uses them to classify Alzheimer's disease in human brain transcriptomes. Reanalyzed 4 public skin and brain single-cell cohorts (295,243 cells and nuclei) with donor-level pseudobulk to map the candidate genes to specific cell types.</span></span>`;
        preparationList.append(manuscript);
      }
      const publicationStats = doc.querySelector('.pubstats');
      if (publicationStats) {
        publicationStats.classList.add('horizontal-summary');
        publicationStats.innerHTML = '<div class="st total"><b>20</b><span>Total</span></div><div class="st"><b>17</b><span>Published</span></div><div class="st"><b>1</b><span>In revision</span></div><div class="st"><b>2</b><span>In preparation</span></div><div class="st authorship"><b>6</b><span>First / Co-first</span> <small>Published &amp; in revision</small></div>';
      }
      for (const title of doc.querySelectorAll('.publist .ttl')) {
        if (title.textContent.includes('Medical and Biomedical Researchers')) {
          title.textContent = 'AI Drug Discovery: A Practical Guide for Biomedical Researchers';
        }
      }
      const bookCitation = doc.querySelector('#books .publist .ct');
      if (bookCitation) {
        bookCitation.innerHTML = bookCitation.innerHTML.replace('Beommun Education', 'PanmunEducation').replace('Forthcoming September 21, 2026', 'September 21, 2026');
      }
      const bookLink = bookCitation?.querySelector('a.pdf');
      if (bookLink) { bookLink.href = 'https://global.yes24.com/Goods/196295329'; bookLink.textContent = 'YES24 Global'; }
      const bookSection = doc.querySelector('#books');
      if (bookSection) {
        const covers = doc.createElement('div');
        covers.className = 'book-covers';
        covers.innerHTML = `<img src="${assetRoot}book-cover-ko_v1.0.0.jpg" alt="Korean book cover" width="1376" height="1811"><img src="${assetRoot}book-cover-en_v1.0.0.png" alt="English-language book cover" width="1093" height="1438">`;
        bookSection.append(covers);
      }
      if (bookCitation && !bookCitation.querySelector('.me')) {
        bookCitation.innerHTML = bookCitation.innerHTML.replace(
          /^Seong-Jun Kang/,
          '<span class="me">Seong-Jun Kang</span>'
        );
      }
      const fundingSection = [...doc.querySelectorAll('.sec')].find((section) =>
        section.querySelector('.sechdr h2')?.textContent.trim() === 'Selected Grant Writing & Program Funding'
      );
      const awardsSection = [...doc.querySelectorAll('.sec')].find((section) =>
        section.querySelector('.sechdr h2')?.textContent.trim() === 'Awards, Patents & Scholarships'
      );
      const presentationsSection = [...doc.querySelectorAll('.sec')].find((section) =>
        section.querySelector('.sechdr h2')?.textContent.trim() === 'Selected Presentations'
      );
      const mentoringSection = [...doc.querySelectorAll('.sec')].find((section) =>
        section.querySelector('.sechdr h2')?.textContent.trim() === 'Mentoring and Research Training'
      );
      if (awardsSection && presentationsSection) {
        const presentationsLabel = doc.createElement('div');
        presentationsLabel.className = 'sublbl';
        presentationsLabel.textContent = 'Selected Presentations';
        awardsSection.append(presentationsLabel);
        for (const child of [...presentationsSection.children]) {
          if (!child.classList.contains('sechdr')) awardsSection.append(child);
        }
        presentationsSection.remove();
      }
      if (awardsSection) {
        const patentLabel = [...awardsSection.querySelectorAll(':scope > .sublbl')].find((label) => label.textContent.trim() === 'Patents');
        if (patentLabel) {
          const patentsSection = doc.createElement('section');
          patentsSection.className = 'sec';
          patentsSection.id = 'patents';
          patentsSection.innerHTML = '<div class="sechdr"><h2>Patents</h2><div class="rule"></div></div>';
          let patentRow = patentLabel.nextElementSibling;
          while (patentRow?.classList.contains('row')) {
            const next = patentRow.nextElementSibling;
            patentsSection.append(patentRow);
            patentRow = next;
          }
          patentLabel.remove();
          awardsSection.before(patentsSection);
        }
        awardsSection.querySelector('.sechdr h2').textContent = 'Awards & Scholarships';
      }
      if (fundingSection && mentoringSection) {
        mentoringSection.before(fundingSection);
      }
      const hyunJeKimReference = [...doc.querySelectorAll('.refblk')].find((item) =>
        item.querySelector('.rn')?.textContent.includes('Hyun Je Kim')
      );
      const hyunJeKimNote = hyunJeKimReference?.querySelector('.rnote');
      if (hyunJeKimNote) {
        hyunJeKimNote.textContent = 'Corresponding on the several single-cell studies; supervised the computational work.';
      }
      const hyoJeongNam = [...doc.querySelectorAll('.mentortable .mname')].find((name) =>
        name.textContent.includes('Hyo Jeong Nam')
      );
      const hyoJeongNamAffiliation = hyoJeongNam?.closest('tr')?.querySelector('.maff');
      if (hyoJeongNamAffiliation) {
        hyoJeongNamAffiliation.textContent = 'Associate Researcher, Human Immune Monitoring Center, Icahn School of Medicine at Mount Sinai, New York, NY, USA';
      }
      const sungBinBae = [...doc.querySelectorAll('.mentortable .mname')].find((name) => name.textContent.includes('Sung Bin Bae'));
      const sungBinBaeAffiliation = sungBinBae?.closest('tr')?.querySelector('.maff');
      if (sungBinBaeAffiliation) sungBinBaeAffiliation.textContent = 'Staff, Biologics CMC Team, Yuhan Corporation, Seoul, Republic of Korea';

      const shell = doc.querySelector('.shell');
      const downloads = doc.createElement('nav');
      downloads.className = 'cv-download-toolbar';
      downloads.setAttribute('aria-label', 'CV downloads');
      const pdfDownload = doc.createElement('a');
      pdfDownload.className = 'cv-file-action';
      pdfDownload.href = './' + exportName + '.pdf';
      pdfDownload.download = exportName + '.pdf';
      pdfDownload.innerHTML = '<span class="cv-file-format">PDF</span><span class="cv-file-copy"><strong>Download</strong><small>CV · PDF</small></span>';
      pdfDownload.setAttribute('aria-label', 'Download CV as PDF');
      const wordDownload = doc.createElement('a');
      wordDownload.className = 'cv-file-action';
      wordDownload.href = './' + exportName + '.docx';
      wordDownload.download = exportName + '.docx';
      wordDownload.innerHTML = '<span class="cv-file-format">DOCX</span><span class="cv-file-copy"><strong>Download</strong><small>CV · Word</small></span>';
      wordDownload.title = 'Download CV as a DOCX document';
      wordDownload.setAttribute('aria-label', 'Download CV as DOCX');
      downloads.append(pdfDownload, wordDownload);
      doc.body.append(downloads);
      const chatToggle = doc.createElement('button');
      chatToggle.type = 'button';
      chatToggle.className = 'cv-chat-fab';
      chatToggle.setAttribute('aria-label', '챗봇 닫기');
      chatToggle.setAttribute('aria-expanded', 'true');
      chatToggle.title = '챗봇 닫기';
      const chatIcon = doc.createElement('img');
      chatIcon.src = assetRoot + 'cute-chatbot.png';
      chatIcon.alt = '';
      chatIcon.setAttribute('aria-hidden', 'true');
      const chatSwitch = doc.createElement('span');
      chatSwitch.className = 'cv-chat-switch';
      chatSwitch.setAttribute('aria-hidden', 'true');
      chatToggle.append(chatIcon, chatSwitch);
      doc.body.append(chatToggle);
      const chatPane = doc.querySelector('.askpane');
      const reduceMotion = frame.contentWindow.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let chatOpen = !chatPane.hidden;
      if (window.innerWidth <= 680) { chatOpen = false; chatPane.hidden = true; chatToggle.setAttribute('aria-expanded', 'false'); }
      let chatAnimation;
      shell.classList.toggle('chat-hidden', !chatOpen);
      const setToggleState = (open) => {
        chatToggle.setAttribute('aria-expanded', String(open));
        chatToggle.setAttribute('aria-label', open ? '챗봇 닫기' : '챗봇 열기');
        chatToggle.title = open ? '챗봇 닫기' : '챗봇 열기';
      };
      const playChatAnimation = async (keyframes, options) => {
        chatAnimation?.cancel();
        const animation = chatPane.animate(keyframes, options);
        chatAnimation = animation;
        try {
          await animation.finished;
        } catch (_) {
          return false;
        }
        if (chatAnimation !== animation) return false;
        chatAnimation = undefined;
        animation.cancel();
        return true;
      };
      chatToggle.addEventListener('click', async () => {
        const opening = !chatOpen;
        chatOpen = opening;
        setToggleState(opening);
        if (opening) {
          chatPane.hidden = false;
          shell.style.setProperty('--chat-layout-duration', reduceMotion ? '0ms' : '530ms');
          shell.classList.remove('chat-hidden');
          if (!reduceMotion) {
            const completed = await playChatAnimation([
              { opacity: 0, filter: 'blur(10px)', clipPath: 'inset(0 0 96% 96% round 999px)', transform: 'translate(-30px, -56px) scale(.05)' },
              { offset: .48, opacity: .58, filter: 'blur(4px)', clipPath: 'inset(0 0 44% 44% round 36px)', transform: 'translate(-15px, -28px) scale(.56)' },
              { offset: .84, opacity: 1, filter: 'blur(0)', clipPath: 'inset(0 0 0 0 round 14px)', transform: 'translate(0, 2px) scale(1.025)' },
              { opacity: 1, filter: 'blur(0)', clipPath: 'inset(0 0 0 0 round 14px)', transform: 'translate(0, 0) scale(1)' },
            ], { duration: 530, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
            if (!completed || !chatOpen) return;
          }
          doc.querySelector('.ksj-composer textarea')?.focus();
          return;
        }
        shell.style.setProperty('--chat-layout-duration', reduceMotion ? '0ms' : '680ms');
        shell.classList.add('chat-hidden');
        if (!reduceMotion) {
          const completed = await playChatAnimation([
            { opacity: 1, filter: 'blur(0)', clipPath: 'inset(0 0 0 0 round 14px)', transform: 'translate(0, 0) scale(1)' },
            { offset: .18, opacity: .94, filter: 'blur(0)', clipPath: 'inset(0 0 0 0 round 14px)', transform: 'translate(0, -7px) scale(.96)' },
            { offset: .62, opacity: .48, filter: 'blur(5px)', clipPath: 'inset(0 0 48% 48% round 38px)', transform: 'translate(-16px, -30px) scale(.5)' },
            { opacity: 0, filter: 'blur(10px)', clipPath: 'inset(0 0 96% 96% round 999px)', transform: 'translate(-30px, -56px) scale(.05)' },
          ], { duration: 680, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
          if (!completed || chatOpen) return;
        }
        chatPane.hidden = true;
      });

})();
