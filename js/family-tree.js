/**
 * FamilyTree Class - Handles family tree visualization and rendering
 */
class FamilyTree {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.sims = new Map();
        this.relationships = [];
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.selectedNode = null;
        this.isPanning = false;
        this.draggedNode = null;
        this.draggedElement = null;
        this.dragStart = { x: 0, y: 0 };
        this.animationFrame = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Mouse events for panning and node dragging
        this.container.addEventListener('mousedown', (e) => {
            // Middle mouse button (button 1) or left click on background for panning
            if (e.button === 1 ||
                (e.button === 0 && (e.target === this.container || e.target.classList.contains('family-tree') || e.target.classList.contains('tree-canvas')))) {
                e.preventDefault();
                this.isPanning = true;
                this.dragStart = { x: e.clientX - this.offsetX, y: e.clientY - this.offsetY };
                this.container.style.cursor = 'grabbing';
            }
        });

        // Prevent context menu on middle click
        this.container.addEventListener('contextmenu', (e) => {
            if (e.button === 1) {
                e.preventDefault();
            }
        });

        // Global mousemove handler for both panning and node dragging
        document.addEventListener('mousemove', (e) => {
            // Handle panning
            if (this.isPanning) {
                this.offsetX = e.clientX - this.dragStart.x;
                this.offsetY = e.clientY - this.dragStart.y;
                this.render();
            }

            // Handle node dragging with optimized rendering
            if (this.draggedNode && this.draggedElement) {
                const newX = (e.clientX - this.dragStart.x) / this.scale;
                const newY = (e.clientY - this.dragStart.y) / this.scale;

                this.draggedNode.x = newX;
                this.draggedNode.y = newY;

                // Update position directly without full re-render for smooth dragging
                if (this.animationFrame) {
                    cancelAnimationFrame(this.animationFrame);
                }

                this.animationFrame = requestAnimationFrame(() => {
                    this.updateNodePosition(this.draggedElement, newX, newY);
                    this.updateConnectionLines();
                });
            }
        });

        // Global mouseup handler
        document.addEventListener('mouseup', () => {
            if (this.isPanning) {
                this.isPanning = false;
                this.container.style.cursor = 'default';
            }

            if (this.draggedNode) {
                this.draggedNode = null;
                this.draggedElement = null;
                // Final render to ensure everything is in sync
                this.render();
            }
        });

        // Wheel event for zooming
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.scale = Math.max(0.3, Math.min(3, this.scale * delta));
            this.render();
        });
    }

    updateNodePosition(element, x, y) {
        if (element && element.style) {
            element.style.left = x + 'px';
            element.style.top = y + 'px';
        }
    }

    updateConnectionLines() {
        const canvas = this.container.querySelector('.tree-canvas');
        if (!canvas) return;

        // Remove old lines
        canvas.querySelectorAll('.connection-line').forEach(line => line.remove());

        // Redraw lines
        this.relationships.forEach(rel => {
            const fromSim = this.sims.get(rel.from);
            const toSim = this.sims.get(rel.to);

            if (fromSim && toSim) {
                const line = this.createConnectionLine(fromSim, toSim, rel.type);
                canvas.insertBefore(line, canvas.firstChild);
            }
        });
    }

    addSim(sim) {
        if (!sim.id) {
            sim.id = 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        // Set default position if not provided
        if (!sim.x || !sim.y) {
            sim.x = 400 + (this.sims.size * 50);
            sim.y = 200 + (this.sims.size * 30);
        }

        this.sims.set(sim.id, sim);
        this.render();
        return sim.id;
    }

    updateSim(id, updates) {
        const sim = this.sims.get(id);
        if (sim) {
            Object.assign(sim, updates);
            this.render();
        }
    }

    deleteSim(id) {
        this.sims.delete(id);
        // Remove all relationships involving this sim
        this.relationships = this.relationships.filter(
            rel => rel.from !== id && rel.to !== id
        );
        this.render();
    }

    addRelationship(relationship) {
        // Check if relationship already exists
        const exists = this.relationships.some(rel =>
            (rel.from === relationship.from && rel.to === relationship.to && rel.type === relationship.type) ||
            (rel.from === relationship.to && rel.to === relationship.from && rel.type === relationship.type)
        );

        if (!exists) {
            this.relationships.push(relationship);
            this.render();
        }
    }

    getSim(id) {
        return this.sims.get(id);
    }

    getAllSims() {
        return Array.from(this.sims.values());
    }

    getRelationships(simId) {
        return this.relationships.filter(
            rel => rel.from === simId || rel.to === simId
        );
    }

    clear() {
        this.sims.clear();
        this.relationships = [];
        this.selectedNode = null;
        this.render();
    }

    zoom(factor) {
        this.scale = Math.max(0.3, Math.min(3, this.scale * factor));
        this.render();
    }

    resetView() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.render();
    }

    calculateLayout() {
        // Simple automatic layout algorithm
        const sims = this.getAllSims();
        if (sims.length === 0) return;

        // Group sims by generation (based on parent relationships)
        const generations = new Map();
        const processed = new Set();

        // Find root sims (those with no parents)
        const roots = sims.filter(sim => {
            const hasParent = this.relationships.some(
                rel => rel.type === 'parent' && rel.to === sim.id
            );
            return !hasParent;
        });

        // BFS to assign generations
        const queue = roots.map(sim => ({ sim, generation: 0 }));

        while (queue.length > 0) {
            const { sim, generation } = queue.shift();

            if (processed.has(sim.id)) continue;
            processed.add(sim.id);

            if (!generations.has(generation)) {
                generations.set(generation, []);
            }
            generations.get(generation).push(sim);

            // Find children
            const children = this.relationships
                .filter(rel => rel.type === 'parent' && rel.from === sim.id)
                .map(rel => this.getSim(rel.to))
                .filter(child => child && !processed.has(child.id));

            children.forEach(child => {
                queue.push({ sim: child, generation: generation + 1 });
            });
        }

        // Position sims by generation
        const startX = 100;
        const startY = 100;
        const horizontalSpacing = 200;
        const verticalSpacing = 150;

        generations.forEach((genSims, gen) => {
            genSims.forEach((sim, index) => {
                sim.x = startX + (index * horizontalSpacing);
                sim.y = startY + (gen * verticalSpacing);
            });
        });

        this.render();
    }

    render() {
        // Clear the container
        const existingTree = this.container.querySelector('.tree-canvas');
        if (existingTree) {
            existingTree.remove();
        }

        // Remove welcome message if there are sims
        const welcomeMsg = this.container.querySelector('.welcome-message');
        if (welcomeMsg && this.sims.size > 0) {
            welcomeMsg.remove();
        }

        if (this.sims.size === 0) {
            if (!welcomeMsg) {
                this.container.innerHTML = `
                    <div class="welcome-message">
                        <i class="fas fa-sitemap fa-3x"></i>
                        <h2>Welcome to Sims Family Tree Editor</h2>
                        <p>Start by adding your first Sim or load an example family tree</p>
                    </div>
                `;
            }
            return;
        }

        // Create canvas
        const canvas = document.createElement('div');
        canvas.className = 'tree-canvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.position = 'relative';
        canvas.style.transform = `scale(${this.scale})`;
        canvas.style.transformOrigin = 'center center';

        // Draw relationship lines first (so they appear behind nodes)
        this.relationships.forEach(rel => {
            const fromSim = this.sims.get(rel.from);
            const toSim = this.sims.get(rel.to);

            if (fromSim && toSim) {
                const line = this.createConnectionLine(fromSim, toSim, rel.type);
                canvas.appendChild(line);
            }
        });

        // Draw nodes
        this.sims.forEach((sim) => {
            const node = this.createNode(sim);
            canvas.appendChild(node);
        });

        this.container.appendChild(canvas);
    }

    createNode(sim) {
        const node = document.createElement('div');
        node.className = 'tree-node';
        node.style.left = sim.x + 'px';
        node.style.top = sim.y + 'px';
        node.dataset.simId = sim.id;

        if (this.selectedNode === sim.id) {
            node.classList.add('selected');
        }

        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'tree-node-avatar';

        if (sim.avatar) {
            const img = document.createElement('img');
            img.src = sim.avatar;
            img.alt = sim.name;
            avatar.appendChild(img);
        } else {
            // Use initials
            const initials = sim.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            avatar.textContent = initials;
            // Color based on gender
            if (sim.gender === 'female') {
                avatar.style.background = '#ec4899';
            } else if (sim.gender === 'male') {
                avatar.style.background = '#3b82f6';
            } else {
                avatar.style.background = '#8b5cf6';
            }
        }

        // Name
        const name = document.createElement('div');
        name.className = 'tree-node-name';
        name.textContent = sim.name;

        // Details
        const details = document.createElement('div');
        details.className = 'tree-node-details';
        details.textContent = `${sim.age || 'Adult'}`;
        if (sim.occupation) {
            details.textContent += ` • ${sim.occupation}`;
        }

        node.appendChild(avatar);
        node.appendChild(name);
        node.appendChild(details);

        // Make node draggable - only set up the mousedown
        node.addEventListener('mousedown', (e) => {
            // Only handle left mouse button
            if (e.button !== 0) return;

            e.stopPropagation();
            e.preventDefault();

            this.draggedNode = sim;
            this.draggedElement = node;
            this.dragStart = {
                x: e.clientX - sim.x * this.scale,
                y: e.clientY - sim.y * this.scale
            };
            node.style.cursor = 'grabbing';
        });

        // Handle click for selection (with drag detection)
        let mouseDownTime = 0;
        let mouseDownPos = { x: 0, y: 0 };

        node.addEventListener('mousedown', (e) => {
            mouseDownTime = Date.now();
            mouseDownPos = { x: e.clientX, y: e.clientY };
        });

        node.addEventListener('mouseup', (e) => {
            const timeDiff = Date.now() - mouseDownTime;
            const distanceMoved = Math.sqrt(
                Math.pow(e.clientX - mouseDownPos.x, 2) +
                Math.pow(e.clientY - mouseDownPos.y, 2)
            );

            // If it was a quick click with minimal movement, treat as selection
            if (timeDiff < 200 && distanceMoved < 5) {
                this.selectNode(sim.id);
            }

            node.style.cursor = 'move';
        });

        // Set initial cursor
        node.style.cursor = 'move';

        return node;
    }

    createConnectionLine(fromSim, toSim, type) {
        const line = document.createElement('div');

        // Calculate center points of nodes
        const fromX = fromSim.x + 80; // approximate center
        const fromY = fromSim.y + 50;
        const toX = toSim.x + 80;
        const toY = toSim.y + 50;

        // Calculate line properties
        const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);

        // Style the line
        line.className = `connection-line ${type}`;
        line.style.width = length + 'px';
        line.style.height = '2px';
        line.style.left = fromX + 'px';
        line.style.top = fromY + 'px';
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 0';
        line.style.zIndex = '0';

        return line;
    }

    selectNode(id) {
        this.selectedNode = id;
        this.render();

        // Dispatch event for external listeners
        const event = new CustomEvent('nodeSelected', { detail: { simId: id } });
        document.dispatchEvent(event);
    }

    exportData() {
        return {
            version: '1.0',
            sims: Array.from(this.sims.values()),
            relationships: this.relationships,
            metadata: {
                created: new Date().toISOString(),
                simCount: this.sims.size
            }
        };
    }

    importData(data) {
        this.clear();

        if (data.sims) {
            data.sims.forEach(sim => {
                this.sims.set(sim.id, sim);
            });
        }

        if (data.relationships) {
            this.relationships = data.relationships;
        }

        this.render();
    }
}
