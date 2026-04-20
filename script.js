// State
let icdData = [];
let activeItem = null;

// DOM Elements
const icdListEl = document.getElementById('icd-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading-indicator');
const welcomeMsg = document.getElementById('welcome-message');
const detailsView = document.getElementById('details-view');

const detailCode = document.getElementById('detail-code');
const detailName = document.getElementById('detail-name');
const detailDesc = document.getElementById('detail-description');
const subtypesContainer = document.getElementById('subtypes-container');
const subtypesGrid = document.getElementById('subtypes-grid');

// Lifecycle
document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        icdData = window.ICD_DATA || [];
        
        // Sort alphanumerically by ICD Code
        icdData.sort((a, b) => {
            const codeA = (a["ICD Code"] || a["Code"] || "").toUpperCase();
            const codeB = (b["ICD Code"] || b["Code"] || "").toUpperCase();
            return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
        });
        
        loadingIndicator.classList.add('hidden');
        renderList(icdData);

        // Bind search
        searchInput.addEventListener('input', handleSearch);
    } catch (e) {
        console.error(e);
        loadingIndicator.innerHTML = `<p style="color:var(--accent);">Error loading data.</p>`;
    }
}

// Render list into Sidebar
function renderList(data, limit = 100) {
    icdListEl.innerHTML = '';
    
    // Use Fragment for performance
    const fragment = document.createDocumentFragment();
    
    const itemsToRender = data.slice(0, limit);
    
    itemsToRender.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'icd-item';
        // Check structural differences to handle keys correctly. The JSON had "ICD Code" or "Code"
        const finalCode = item["ICD Code"] || item["Code"] || "N/A";
        
        li.innerHTML = `
            <span class="item-code">${finalCode}</span>
            <span class="item-name">${item.Name || "Unnamed"}</span>
        `;
        
        li.addEventListener('click', () => {
            selectItem(item, li);
        });
        
        fragment.appendChild(li);
    });
    
    if (data.length > limit) {
        const hint = document.createElement('li');
        hint.style.textAlign = "center";
        hint.style.padding = "10px";
        hint.style.fontSize = "0.8rem";
        hint.style.color = "var(--text-muted)";
        hint.textContent = `Showing ${limit} of ${data.length} results. Use search for more.`;
        fragment.appendChild(hint);
    } else if (data.length === 0) {
        const empty = document.createElement('li');
        empty.style.textAlign = "center";
        empty.style.padding = "20px";
        empty.style.color = "var(--text-muted)";
        empty.textContent = "No results found.";
        fragment.appendChild(empty);
    }
    
    icdListEl.appendChild(fragment);
}

// Handle real-time Search
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
        renderList(icdData);
        return;
    }
    
    // Filtering logic
    const filtered = icdData.filter(item => {
        const code = (item["ICD Code"] || item["Code"] || "").toLowerCase();
        const name = (item.Name || "").toLowerCase();
        const desc = (item.Description || "").toLowerCase();
        return code.includes(query) || name.includes(query) || desc.includes(query);
    });
    
    renderList(filtered);
}

// Display Data in Main View
function selectItem(item, liElement) {
    // UI state for active list item
    document.querySelectorAll('.icd-item').forEach(el => el.classList.remove('active'));
    if (liElement) liElement.classList.add('active');

    // Toggle views
    welcomeMsg.classList.add('hidden');
    detailsView.classList.remove('hidden');
    
    // Hack: remove and re-add class to trigger fade-in animations
    detailsView.classList.remove('anim-fade-in-up');
    void detailsView.offsetWidth; // trigger reflow
    detailsView.classList.add('anim-fade-in-up');

    // Fill Details
    const code = item["ICD Code"] || item["Code"] || "N/A";
    detailCode.textContent = code;
    detailName.textContent = item.Name || "No Name Provided";
    detailDesc.textContent = item.Description || "No description available for this category.";
    
    // Handle Subtypes
    const subtypes = item["Sub Types"] || item["SubTypes"] || [];
    if (subtypes.length > 0) {
        subtypesContainer.classList.remove('hidden');
        renderSubtypes(subtypes);
    } else {
        subtypesContainer.classList.add('hidden');
        subtypesGrid.innerHTML = '';
    }
    
    // Scroll Main container to top
    document.getElementById('main-content').scrollTop = 0;
}

// Populate grid with subtype cards
function renderSubtypes(subtypes) {
    subtypesGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    subtypes.forEach(s => {
        const card = document.createElement('div');
        card.className = 'subtype-card glass-sub-panel';
        
        const cardCode = s["ICD Code"] || s["Code"] || "";
        const cardName = s.Name || "";
        const cardDesc = s.Description || "No description.";
        
        card.innerHTML = `
            <div class="subtype-code">${cardCode}</div>
            <div class="subtype-name">${cardName}</div>
            <div class="subtype-desc">${cardDesc}</div>
        `;
        
        // Add expansion logic for long descriptions
        card.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
        
        fragment.appendChild(card);
    });
    
    subtypesGrid.appendChild(fragment);
}
