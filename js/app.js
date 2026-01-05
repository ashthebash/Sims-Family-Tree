/**
 * Main Application Logic
 */

// Initialize the family tree
const familyTree = new FamilyTree('familyTree');

// State
let currentEditingSim = null;

// DOM Elements
const simModal = document.getElementById('simModal');
const relationshipModal = document.getElementById('relationshipModal');
const simForm = document.getElementById('simForm');
const relationshipForm = document.getElementById('relationshipForm');
const simsList = document.getElementById('simsList');
const searchSims = document.getElementById('searchSims');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadFromLocalStorage();
    updateSimsList();
});

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Toolbar buttons
    document.getElementById('addSimBtn').addEventListener('click', () => openSimModal());
    document.getElementById('addRelationshipBtn').addEventListener('click', () => openRelationshipModal());
    document.getElementById('zoomInBtn').addEventListener('click', () => familyTree.zoom(1.2));
    document.getElementById('zoomOutBtn').addEventListener('click', () => familyTree.zoom(0.8));
    document.getElementById('resetViewBtn').addEventListener('click', () => familyTree.resetView());
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('exportBtn').addEventListener('click', exportToJSON);
    document.getElementById('loadExampleBtn').addEventListener('click', loadExampleFamily);
    document.getElementById('clearBtn').addEventListener('click', clearAllData);

    // Import file
    document.getElementById('importFile').addEventListener('change', importFromJSON);

    // Modal close buttons
    document.getElementById('closeModal').addEventListener('click', closeSimModal);
    document.getElementById('cancelBtn').addEventListener('click', closeSimModal);
    document.getElementById('closeRelationshipModal').addEventListener('click', closeRelationshipModal);
    document.getElementById('cancelRelationshipBtn').addEventListener('click', closeRelationshipModal);

    // Form submissions
    simForm.addEventListener('submit', handleSimFormSubmit);
    relationshipForm.addEventListener('submit', handleRelationshipFormSubmit);

    // Relationship type change
    document.getElementById('relationType').addEventListener('change', updateRelationshipFields);

    // Search functionality
    searchSims.addEventListener('input', updateSimsList);

    // Node selection
    document.addEventListener('nodeSelected', (e) => {
        highlightSimInList(e.detail.simId);
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === simModal) closeSimModal();
        if (e.target === relationshipModal) closeRelationshipModal();
    });

    // Auto-save to localStorage
    setInterval(saveToLocalStorage, 30000); // Auto-save every 30 seconds
}

/**
 * Sim Modal Functions
 */
function openSimModal(simId = null) {
    currentEditingSim = simId;
    const modalTitle = document.getElementById('modalTitle');

    if (simId) {
        const sim = familyTree.getSim(simId);
        modalTitle.textContent = 'Edit Sim';

        // Populate form
        document.getElementById('simId').value = sim.id;
        document.getElementById('simName').value = sim.name;
        document.getElementById('simGender').value = sim.gender || 'male';
        document.getElementById('simAge').value = sim.age || 'adult';
        document.getElementById('simTraits').value = sim.traits || '';
        document.getElementById('simAspiration').value = sim.aspiration || '';
        document.getElementById('simOccupation').value = sim.occupation || '';
        document.getElementById('simAvatar').value = sim.avatar || '';
        document.getElementById('simNotes').value = sim.notes || '';
    } else {
        modalTitle.textContent = 'Add New Sim';
        simForm.reset();
    }

    simModal.classList.add('show');
}

function closeSimModal() {
    simModal.classList.remove('show');
    simForm.reset();
    currentEditingSim = null;
}

function handleSimFormSubmit(e) {
    e.preventDefault();

    const simData = {
        name: document.getElementById('simName').value,
        gender: document.getElementById('simGender').value,
        age: document.getElementById('simAge').value,
        traits: document.getElementById('simTraits').value,
        aspiration: document.getElementById('simAspiration').value,
        occupation: document.getElementById('simOccupation').value,
        avatar: document.getElementById('simAvatar').value,
        notes: document.getElementById('simNotes').value
    };

    if (currentEditingSim) {
        // Update existing sim
        familyTree.updateSim(currentEditingSim, simData);
    } else {
        // Add new sim
        familyTree.addSim(simData);
    }

    updateSimsList();
    updateRelationshipSelects();
    saveToLocalStorage();
    closeSimModal();
}

/**
 * Relationship Modal Functions
 */
function openRelationshipModal() {
    if (familyTree.getAllSims().length < 2) {
        alert('You need at least 2 sims to create a relationship!');
        return;
    }

    updateRelationshipSelects();
    relationshipModal.classList.add('show');
}

function closeRelationshipModal() {
    relationshipModal.classList.remove('show');
    relationshipForm.reset();
}

function updateRelationshipFields() {
    const type = document.getElementById('relationType').value;

    document.getElementById('parentChildFields').style.display = type === 'parent' ? 'block' : 'none';
    document.getElementById('spouseFields').style.display = type === 'spouse' ? 'block' : 'none';
    document.getElementById('siblingFields').style.display = type === 'sibling' ? 'block' : 'none';
}

function updateRelationshipSelects() {
    const sims = familyTree.getAllSims();
    const selects = ['parentSim', 'childSim', 'spouse1', 'spouse2', 'sibling1', 'sibling2'];

    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        const currentValue = select.value;

        select.innerHTML = '<option value="">Select...</option>';
        sims.forEach(sim => {
            const option = document.createElement('option');
            option.value = sim.id;
            option.textContent = sim.name;
            select.appendChild(option);
        });

        if (currentValue) select.value = currentValue;
    });
}

function handleRelationshipFormSubmit(e) {
    e.preventDefault();

    const type = document.getElementById('relationType').value;
    let from, to;

    if (type === 'parent') {
        from = document.getElementById('parentSim').value;
        to = document.getElementById('childSim').value;
    } else if (type === 'spouse') {
        from = document.getElementById('spouse1').value;
        to = document.getElementById('spouse2').value;
    } else if (type === 'sibling') {
        from = document.getElementById('sibling1').value;
        to = document.getElementById('sibling2').value;
    }

    if (!from || !to) {
        alert('Please select both sims for the relationship!');
        return;
    }

    if (from === to) {
        alert('Cannot create a relationship with the same sim!');
        return;
    }

    familyTree.addRelationship({ from, to, type });
    saveToLocalStorage();
    closeRelationshipModal();
}

/**
 * Sims List Functions
 */
function updateSimsList(searchTerm = '') {
    const sims = familyTree.getAllSims();
    const search = searchTerm || searchSims.value.toLowerCase();

    const filteredSims = sims.filter(sim =>
        sim.name.toLowerCase().includes(search) ||
        (sim.traits && sim.traits.toLowerCase().includes(search)) ||
        (sim.occupation && sim.occupation.toLowerCase().includes(search))
    );

    if (filteredSims.length === 0) {
        simsList.innerHTML = '<p class="empty-state">No sims found</p>';
        return;
    }

    simsList.innerHTML = filteredSims.map(sim => createSimCard(sim)).join('');

    // Add event listeners to sim cards
    document.querySelectorAll('.sim-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn')) {
                familyTree.selectNode(card.dataset.simId);
            }
        });

        card.querySelector('.edit-sim-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            openSimModal(card.dataset.simId);
        });

        card.querySelector('.delete-sim-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this sim?')) {
                familyTree.deleteSim(card.dataset.simId);
                updateSimsList();
                updateRelationshipSelects();
                saveToLocalStorage();
            }
        });
    });
}

function createSimCard(sim) {
    const avatarContent = sim.avatar
        ? `<img src="${sim.avatar}" alt="${sim.name}">`
        : sim.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const genderColor = sim.gender === 'female' ? '#ec4899' : sim.gender === 'male' ? '#3b82f6' : '#8b5cf6';
    const avatarStyle = sim.avatar ? '' : `style="background-color: ${genderColor}"`;

    return `
        <div class="sim-card" data-sim-id="${sim.id}">
            <div class="sim-card-header">
                <div class="sim-avatar" ${avatarStyle}>
                    ${avatarContent}
                </div>
                <div class="sim-info">
                    <h4>${sim.name}</h4>
                    <div class="sim-meta">${sim.age || 'Adult'} • ${sim.gender || 'N/A'}</div>
                </div>
            </div>
            ${sim.occupation ? `<div class="sim-meta"><i class="fas fa-briefcase"></i> ${sim.occupation}</div>` : ''}
            ${sim.traits ? `<div class="sim-meta"><i class="fas fa-star"></i> ${sim.traits}</div>` : ''}
            <div class="sim-actions">
                <button class="btn btn-primary btn-sm edit-sim-btn">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm delete-sim-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

function highlightSimInList(simId) {
    document.querySelectorAll('.sim-card').forEach(card => {
        if (card.dataset.simId === simId) {
            card.classList.add('selected');
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            card.classList.remove('selected');
        }
    });
}

/**
 * Import/Export Functions
 */
function exportToJSON() {
    const data = familyTree.exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `sims-family-tree-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importFromJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);

            if (familyTree.getAllSims().length > 0) {
                if (!confirm('This will replace your current family tree. Continue?')) {
                    return;
                }
            }

            familyTree.importData(data);
            updateSimsList();
            updateRelationshipSelects();
            saveToLocalStorage();
            alert('Family tree imported successfully!');
        } catch (error) {
            alert('Error importing file: ' + error.message);
        }
    };
    reader.readAsText(file);

    // Reset file input
    e.target.value = '';
}

/**
 * LocalStorage Functions
 */
function saveToLocalStorage() {
    const data = familyTree.exportData();
    localStorage.setItem('simsFamily Tree', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('simsFamilyTree');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            familyTree.importData(data);
            updateSimsList();
            updateRelationshipSelects();
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

/**
 * Example Data
 */
function loadExampleFamily() {
    if (familyTree.getAllSims().length > 0) {
        if (!confirm('This will replace your current family tree. Continue?')) {
            return;
        }
    }

    const exampleData = {
        version: '1.0',
        sims: [
            {
                id: 'sim_1',
                name: 'Bella Goth',
                gender: 'female',
                age: 'adult',
                traits: 'Family-Oriented, Romantic, Creative',
                aspiration: 'Successful Lineage',
                occupation: 'Politician',
                x: 300,
                y: 100,
                notes: 'Matriarch of the Goth family'
            },
            {
                id: 'sim_2',
                name: 'Mortimer Goth',
                gender: 'male',
                age: 'adult',
                traits: 'Bookworm, Genius, Family-Oriented',
                aspiration: 'Renaissance Sim',
                occupation: 'Scientist',
                x: 500,
                y: 100,
                notes: 'Patriarch of the Goth family'
            },
            {
                id: 'sim_3',
                name: 'Cassandra Goth',
                gender: 'female',
                age: 'young-adult',
                traits: 'Creative, Perfectionist, Music Lover',
                aspiration: 'Musical Genius',
                occupation: 'Musician',
                x: 250,
                y: 300,
                notes: 'Eldest daughter'
            },
            {
                id: 'sim_4',
                name: 'Alexander Goth',
                gender: 'male',
                age: 'child',
                traits: 'Creative, Outgoing',
                aspiration: 'Artistic Prodigy',
                occupation: '',
                x: 450,
                y: 300,
                notes: 'Youngest son'
            },
            {
                id: 'sim_5',
                name: 'Cornelia Goth',
                gender: 'female',
                age: 'elder',
                traits: 'Proper, Snob, Art Lover',
                aspiration: 'Fabulously Wealthy',
                occupation: 'Retired',
                x: 550,
                y: -100,
                notes: "Mortimer's mother"
            }
        ],
        relationships: [
            { from: 'sim_1', to: 'sim_2', type: 'spouse' },
            { from: 'sim_1', to: 'sim_3', type: 'parent' },
            { from: 'sim_2', to: 'sim_3', type: 'parent' },
            { from: 'sim_1', to: 'sim_4', type: 'parent' },
            { from: 'sim_2', to: 'sim_4', type: 'parent' },
            { from: 'sim_3', to: 'sim_4', type: 'sibling' },
            { from: 'sim_5', to: 'sim_2', type: 'parent' }
        ],
        metadata: {
            created: new Date().toISOString(),
            simCount: 5
        }
    };

    familyTree.importData(exampleData);
    updateSimsList();
    updateRelationshipSelects();
    saveToLocalStorage();
}

/**
 * Clear All Data
 */
function clearAllData() {
    if (!confirm('Are you sure you want to delete everything? This cannot be undone!')) {
        return;
    }

    familyTree.clear();
    updateSimsList();
    localStorage.removeItem('simsFamilyTree');
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    saveToLocalStorage();
});
