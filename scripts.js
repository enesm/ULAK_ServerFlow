fetch('servers.json')
    .then(response => response.json())
    .then(serverData => {
        const typeIcons = {
            database: 'icons/database.svg',
            web: 'icons/web-server.svg',
            application: 'icons/app-server.svg',
            backup: 'icons/backup-server.svg'
        };

        const osIcons = {
            windows: 'icons/windows.svg',
            linux: 'icons/linux.svg',
            mac: 'icons/mac.svg',
            ubuntu: 'icons/ubuntu.svg'
        };

        const nodes = new vis.DataSet(serverData.map(server => ({
            id: server.id,
            label: server.label,
            shape: 'image',
            image: typeIcons[server.type],
            font: {
                face: 'Arial',
                size: 12,
                color: '#252525',
                strokeWidth: 1,
                strokeColor: '#bbbbbb'
            }
        })));

        const edges = new vis.DataSet(serverData.flatMap(server =>
            server.connections.map(connection => ({
                from: server.id,
                to: connection,
                arrows: 'to',
                color: { color: '#007bff',highlight:'#f66912' },
                width: 2,
                length: 400
            }))
        ));

        const defaultPhysicsOptions = {
            physics: {
                enabled: true
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
