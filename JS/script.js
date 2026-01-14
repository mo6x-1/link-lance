document.addEventListener('DOMContentLoaded', function() {
    // --- Role switcher and search behavior ---
    const roleButtons = document.querySelectorAll('.role-btn');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    let currentRole = 'client';

    function updateSearchPlaceholder(role) {
        if (!searchInput) return;
        if (role === 'client') {
            searchInput.placeholder = 'Search for a freelancer, skill, or service...';
        } else {
            searchInput.placeholder = 'Search available projects and jobs...';
        }
    }

    if (roleButtons && roleButtons.length) {
        roleButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                roleButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentRole = this.dataset.role || 'client';
                updateSearchPlaceholder(currentRole);
            });
        });
        // initialize
        const active = document.querySelector('.role-btn.active');
        if (active) currentRole = active.dataset.role || currentRole;
        updateSearchPlaceholder(currentRole);
    } else {
        updateSearchPlaceholder(currentRole);
    }

    function doSearch() {
        if (!searchInput) return;
        const q = searchInput.value.trim();
        if (!q) {
            alert('Please enter a search term.');
            searchInput.focus();
            return;
        }
        const encoded = encodeURIComponent(q);
        // If user is searching from Services page, always show jobs results
        const page = window.location.pathname.split('/').pop();
        if (page === 'services.html') {
            window.location.href = `jobs.html?query=${encoded}`;
            return;
        }

        if (currentRole === 'client') {
            window.location.href = `profile.html?query=${encoded}`;
        } else {
            window.location.href = `jobs.html?query=${encoded}`;
        }
    }

    if (searchButton) {
        searchButton.addEventListener('click', doSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') doSearch();
        });
    }

    // --- Sidebar filters (jobs page) ---
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.addEventListener('change', function(e) {
            const target = e.target;
            if (!target) return;
            if (target.type === 'checkbox' || target.type === 'radio') {
                // For now just log selected filters. Replace with fetch/AJAX as needed.
                console.log('Filter changed:', target.name, target.value, target.checked);
            }
        });
    }

    // --- Jobs page client-side filtering ---
    const jobCards = Array.from(document.querySelectorAll('.job-card'));
    function normalizeText(str){ return (str||'').toString().toLowerCase(); }

    const categoryKeywordMap = {
        web: ['web','shopify','e-commerce','react','vue','laravel','node','javascript','html','css'],
        mobile: ['mobile','ios','android','app','flutter','react native'],
        design: ['design','logo','brand','graphic','illustrator','figma','ui','ux'],
        marketing: ['seo','marketing','ads','social','content','growth'],
        product: ['product','roadmap','mvp','strategy','product manager'],
        devops: ['devops','cloud','infrastructure','ci/cd','aws','azure','gcp'],
        data: ['data','analytics','dashboard','ml','machine learning','database','sql'],
        writing: ['writing','content','article','translation','seo','copy']
    };

    function jobMatchesCategory(job, category){
        if (!category) return true;
        const text = normalizeText(
            (job.querySelector('h4')?.textContent || '') + ' ' +
            (job.querySelector('.job-description')?.textContent || '') + ' ' +
            Array.from(job.querySelectorAll('.job-skills span')).map(s=>s.textContent).join(' ')
        );
        const keywords = categoryKeywordMap[category] || [category];
        return keywords.some(k => text.includes(k));
    }

    function jobMatchesQuery(job, q){
        if (!q) return true;
        const text = normalizeText(
            (job.querySelector('h4')?.textContent || '') + ' ' +
            (job.querySelector('.job-description')?.textContent || '') + ' ' +
            Array.from(job.querySelectorAll('.job-skills span')).map(s=>s.textContent).join(' ')
        );
        return text.includes(q.toLowerCase());
    }

    function filterJobs(category, q){
        if (!jobCards || jobCards.length === 0) return;
        jobCards.forEach(job => {
            const show = jobMatchesCategory(job, category) && jobMatchesQuery(job, q);
            job.style.display = show ? '' : 'none';
        });
    }


    // --- Mobile nav toggle ---
    const header = document.querySelector('header');
    const nav = document.querySelector('header nav');
    let navToggle = null;
    if (header && nav) {
        const toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Toggle navigation');
        toggle.innerHTML = '\u2630'; // simple hamburger
        header.insertBefore(toggle, header.firstChild);
        navToggle = toggle;

        toggle.addEventListener('click', function() {
            const open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        // close nav on outside click (mobile)
        document.addEventListener('click', function(e) {
            if (!nav.classList.contains('open')) return;
            if (!header.contains(e.target)) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Close mobile nav when any nav link is clicked
    try {
        const navLinks = document.querySelectorAll('header nav a');
        navLinks.forEach(a => a.addEventListener('click', function(){
            if (nav && nav.classList.contains('open')) nav.classList.remove('open');
            if (navToggle) navToggle.setAttribute('aria-expanded','false');
        }));
    } catch(e){}

    // --- Auth modal (create and open) ---
    // Authentication UI is handled via dedicated page(s).
    // Removed in-page modal creation and direct login/signup JS handlers
    // to keep authentication flow on `log in sign up.html`.
    function redirectToAuthPage() {
        window.location.href = 'log in sign up.html';
    }

    // --- Highlight active nav link ---
    (function highlightNav() {
        try {
            const path = window.location.pathname.split('/').pop() || 'main.html';
            const links = document.querySelectorAll('header nav a');
            links.forEach(a => {
                const href = a.getAttribute('href');
                if (!href) return;
                if (href === path || (href === 'main.html' && (path === '' || path === 'index.html' || path === 'main.html'))) {
                    a.classList.add('active');
                }
            });
        } catch (e) { /* ignore */ }
    })();

    // --- Auth nav state: show user menu when logged in ---
    function getAuthUser() {
        try {
            const email = localStorage.getItem('ll_auth');
            if (!email) return null;
            const users = JSON.parse(localStorage.getItem('ll_users') || '{}');
            const user = users[email.toLowerCase()] || null;
            return user || { email };
        } catch (e) { return null; }
    }

    function createUserMenu(user) {
        const container = document.createElement('div');
        container.className = 'user-menu';
        const btn = document.createElement('button');
        btn.className = 'user-btn';
        btn.type = 'button';
        // show only a user icon (no username text)
        btn.innerHTML = `<i class="fas fa-user"></i> <i class="fas fa-caret-down"></i>`;

        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        // Provide Profile link and Log out action
            // show Messages instead of Profile, plus logout
            dropdown.innerHTML = `<a href="messages.html">Messages</a><a href="#" class="logout-link">Log out</a>`;

        container.appendChild(btn);
        container.appendChild(dropdown);

        // Toggle dropdown
        btn.addEventListener('click', function(e){
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
        // Close on outside
        document.addEventListener('click', function(){ dropdown.classList.remove('open'); });

        // Logout handler: clear auth and update nav
        const logoutEl = dropdown.querySelector('.logout-link');
        if (logoutEl) {
            logoutEl.addEventListener('click', function(e){
                e.preventDefault();
                // clear logged-in user
                try { localStorage.removeItem('ll_auth'); } catch (err) { /* ignore */ }
                // close dropdown
                dropdown.classList.remove('open');
                // update nav state if helper exists
                if (typeof window.updateAuthNav === 'function') {
                    try { window.updateAuthNav(); } catch(err) { /* ignore */ }
                }
                // redirect to main/home page
                window.location.href = 'main.html';
            });
        }

        return container;
    }

    function updateAuthNav() {
        try {
            const authButtons = document.querySelector('.auth-buttons');
            const existingMenu = document.querySelector('.user-menu');
            if (existingMenu) existingMenu.remove();
            const user = getAuthUser();
            if (user) {
                if (authButtons) authButtons.style.display = 'none';
                const header = document.querySelector('header');
                const menu = createUserMenu(user);
                // insert menu after nav or into header
                if (header) header.appendChild(menu);
                // ensure profile nav item (profile) with avatar
                try { insertProfileNav(user); } catch(e){}
            } else {
                if (authButtons) authButtons.style.display = '';
            }
        } catch (e) { console.warn('updateAuthNav error', e); }
    }

    // expose for auth.js to call after login/signup
    window.updateAuthNav = updateAuthNav;

    // run on load to set initial nav state
    updateAuthNav();

    // Insert or update a visible nav link with avatar + label "profile"
    function insertProfileNav(user){
        try{
            const nav = document.querySelector('header nav ul');
            if (!nav) return;
            // remove existing if present
            const existing = document.getElementById('nav-profile-li');
            if (existing) existing.remove();

            // get stored profile (may include avatar data URL)
            const profiles = JSON.parse(localStorage.getItem('ll_profile') || '{}');
            const profile = profiles[user.email.toLowerCase()] || null;

            const li = document.createElement('li');
            li.id = 'nav-profile-li';
            const a = document.createElement('a');
            a.href = 'profile.html';
            a.className = 'nav-profile-link';

            const img = document.createElement('img');
            img.className = 'nav-avatar';
            img.alt = 'Profile avatar';
            img.style.width = '28px';
            img.style.height = '28px';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            img.style.marginRight = '8px';

            if (profile && profile.avatar) {
                img.src = profile.avatar;
            } else {
                img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="16" fill="%233b5998"/></svg>';
            }

            const span = document.createElement('span');
            span.textContent = 'profile';

            a.appendChild(img);
            a.appendChild(span);
            li.appendChild(a);

            // append at end of nav list
            nav.appendChild(li);
        } catch(e){ console.warn('insertProfileNav', e); }
    }

    // --- Apply query param hinting (show search term on pages) ---
    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }
    const q = getQueryParam('query');
    if (q && searchInput) {
        searchInput.value = q;
    }

    // If on jobs page: apply filtering based on ?category= and ?query=
    (function applyJobFiltersFromQuery(){
        try{
            const page = window.location.pathname.split('/').pop();
            if (page !== 'jobs.html') return;
            const category = getQueryParam('category');
            const query = getQueryParam('query');
            // prefill search input if present
            if (query && searchInput) searchInput.value = query;
            filterJobs(category, query);
        } catch(e){ console.warn(e); }
    })();

    // Wire apply buttons to open auth modal (simulate apply flow)
    try{
        document.querySelectorAll('.job-apply-btn').forEach(btn => {
            btn.addEventListener('click', function(e){
                e.preventDefault();
                // Redirect applicants to the auth page (signup/login)
                redirectToAuthPage();
            });
        });
    } catch(e){}

});

// End of script.js
