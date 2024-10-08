fetch('servers.json')
    .then(response => response.json())
    .then(serverData => {
        const typeIcons = {
            server: 'asset/server.svg',
            database: 'asset/database.svg',
            web: 'asset/web-server.svg',
            application: 'asset/app-server.svg',
            backup: 'asset/backup-server.svg',
            ipsec: 'asset/ipsec.svg',
            vpn: 'asset/vpn.svg',
            anydesk: 'asset/anydesk.svg'
        };

        const osIcons = {
            windows: 'asset/windows.svg',
            linux: 'asset/linux.svg',
            mac: 'asset/mac.svg',
            ubuntu: 'asset/ubuntu.svg'
        };

        const nodes = new vis.DataSet(serverData.map(server => ({
            id: server.id,
            label: server.label,
            shape: 'image',
            image: typeIcons[server.type],
            font: {
                size: 12,
                color: '#252525',
                background: 'rgba(255,255,255,0.3)'
            }
        })));

        const edges = new vis.DataSet(serverData.flatMap(server =>
            server.connections.map(connection => ({
                from: server.id,
                to: connection,
                arrows: 'to',
                color: { color: '#007bff', highlight:'#f66912' },
                width: 2,
                length: 400
            }))
        ));

        const defaultPhysicsOptions = {
            physics: {
                enabled: true,
                solver: 'repulsion',  // Repulsion solver seçildi.
                repulsion: {
                    nodeDistance: 150,   // Düğümler arası minimum mesafe (varsayılan 100).
                    centralGravity: 0.01, // Ağ merkezine çekim gücü.
                    springLength: 150,   // Düğümleri birbirine bağlayan yayların varsayılan uzunluğu.
                    springConstant: 0.2 // Yayların esneklik sabiti.
                },
                maxVelocity: 50,      // Maksimum hız
                minVelocity: 0.1,     // Düğümlerin minimum hız seviyesi
                timestep: 0.5
            },
            interaction: {
                zoomView: true
            }
        };

        const noPhysicsOptions = {
            physics: {
                enabled: false
            },
            interaction: {
                zoomView: true
            }
        };

        const container = document.getElementById('network');
        const data = { nodes, edges };
        const network = new vis.Network(container, data, defaultPhysicsOptions);

        // network.once('stabilized', function() {
        //     network.moveTo({
        //         scale: 0.5
        //     });
        // });

        document.getElementById('physicsToggle').addEventListener('change', function() {
            options = this.checked ? defaultPhysicsOptions : noPhysicsOptions;
            network.setOptions(options);
        });

        document.getElementById('zoomIn').addEventListener('click', function() {
            network.moveTo({ scale: network.getScale() * 1.2 });
        });

        document.getElementById('zoomOut').addEventListener('click', function() {
            network.moveTo({ scale: network.getScale() / 1.2 });
        });

        network.on('click', function(params) {
            if (params.nodes.length) {
                const nodeId = params.nodes[0];
                const node = serverData.find(server => server.id === nodeId);
                if (node) {
                    const popup = document.getElementById('popup');
                    const popupContent = document.getElementById('popup-content');
                    popupContent.innerHTML = `
                        <img src="${osIcons[node.os]}" alt="${node.os}" style="width: 25px; height: 25px; display: block; padding-bottom: 10px;">
                        <strong>${node.label}</strong><br>
                        ${node.hardware}
                    `;
                    popup.style.left = `${params.pointer.DOM.x}px`;
                    popup.style.top = `${params.pointer.DOM.y}px`;
                    popup.style.display = 'block';
                }
            } else {
                document.getElementById('popup').style.display = 'none';
            }
        });

        document.querySelector('.close-btn').addEventListener('click', function() {
            document.getElementById('popup').style.display = 'none';
        });
    })
    .catch(error => console.error('Error loading the JSON file:', error));
