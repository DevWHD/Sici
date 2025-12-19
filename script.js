require(["esri/Map", "esri/views/MapView", "esri/layers/GeoJSONLayer", "esri/Graphic", "esri/symbols/SimpleMarkerSymbol", "esri/geometry/Point"], 
  function(Map, MapView, GeoJSONLayer, Graphic, SimpleMarkerSymbol, Point) {

  console.log('✓ Script carregado!');

  // Elementos da sidebar
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebarOpenBtn = document.getElementById("sidebar-open-btn");
  const toggleUnitsBtn = document.getElementById("toggle-units");
  const unitsSection = document.getElementById("units-section");

  // Controlar toggle de unidades
  toggleUnitsBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    const isHidden = unitsSection.style.display === "none";
    unitsSection.style.display = isHidden ? "block" : "none";
    toggleUnitsBtn.textContent = isHidden ? "−" : "+";
  });
  
  // Clique no SMS para ir ao marcador
  const smsButton = document.querySelector('.sms-button');
  if (smsButton) {
    smsButton.addEventListener('click', function(e) {
      // Se clicou no botão +, não fazer nada (deixar para toggleUnitsBtn)
      if (e.target.closest('#toggle-units')) return;
      
      // Encontrar e focar no marcador SMS
      const smsMarker = SMS_MARKERS.find(marker => marker.attributes && marker.attributes.nome === "SMS");
      if (smsMarker) {
        view.goTo({
          target: smsMarker.geometry,
          zoom: 16
        });
        
        // Encontrar o dado SMS para mostrar no painel
        if (ALL_ORGANS_DATA) {
          const smsData = ALL_ORGANS_DATA.find(o => o.nome === "SMS");
          if (smsData) {
            setTimeout(() => {
              showInfoPanel(smsData);
            }, 500);
          }
        }
      }
    });
  }

  // Controlar sidebar
  sidebarToggle.addEventListener("click", function() {
    sidebar.classList.add("hidden");
    sidebarOpenBtn.classList.add("visible");
  });

  sidebarOpenBtn.addEventListener("click", function() {
    sidebar.classList.remove("hidden");
    sidebarOpenBtn.classList.remove("visible");
  });

  // Criar mapa
  const map = new Map({
    basemap: "topo-vector"
  });

  console.log('✓ Mapa criado');

  // Criar view
  const view = new MapView({
    container: "map",
    map: map,
    center: [-43.2, -22.85],
    zoom: 11
  });

  console.log('✓ View criado');

  const infoPanel = document.getElementById("info-panel");
  const infoPanelContent = document.getElementById("panel-content");
  const closePanel = document.getElementById("close-panel");

  const SMS_MARKERS = [];
  const BAIRRO_MARKERS = [];
  let ALL_ORGANS_DATA = []; // Store all organs data

  // Close panel button
  closePanel.addEventListener("click", function() {
    infoPanel.classList.remove("active");
  });

  // Carregar camada do contorno do Rio de Janeiro
  function loadRioStateLayer() {
    console.log('Carregando contorno do Rio de Janeiro...');

    const geoJsonUrl = "https://pgeo3.rio.rj.gov.br/arcgis/rest/services/Cartografia/Limites_administrativos/MapServer/0/query?outFields=*&where=1%3D1&f=geojson";

    const rioLayer = new GeoJSONLayer({
      url: geoJsonUrl,
      title: "Estado do Rio de Janeiro",
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [255, 255, 255, 0],
          outline: {
            color: [0, 51, 153],
            width: 2.5
          }
        }
      }
    });

    map.add(rioLayer);
    console.log('✓ Contorno do Rio de Janeiro carregado');
  }

  // Carregar marcadores SMS
  function loadSMSMarkers() {
    console.log('Carregando marcadores SMS...');

    fetch('dados.json')
      .then(response => response.json())
      .then(data => {
        ALL_ORGANS_DATA = data; // Store for sidebar list
        console.log(`✓ ${data.length} locais SMS carregados`);
        
        data.forEach((location, index) => {
          addSMSMarker(location);
        });
        
        // Load organs list in sidebar
        loadOrgaosList(data);
        
        console.log(`✓ Total de ${SMS_MARKERS.length} marcadores SMS adicionados ao mapa`);
      })
      .catch(error => console.error('✗ Erro ao carregar SMS:', error));
  }

  // Carregar lista de órgãos na sidebar
  function loadOrgaosList(orgaosData) {
    const orgaosList = document.getElementById("orgaos-list");
    const orgaosCount = document.getElementById("orgaos-count");
    const searchInput = document.getElementById("orgao-search");

    // Filtrar SMS das outras unidades
    const smsUnit = orgaosData.find(o => o.nome === "SMS");
    const otherUnits = orgaosData.filter(o => o.nome !== "SMS");
    
    // Atualizar contagem com o número de unidades (sem SMS)
    orgaosCount.textContent = otherUnits.length;

    function renderOrgaos(filteredData) {
      orgaosList.innerHTML = '';
      filteredData.forEach((orgao, index) => {
        const item = document.createElement('div');
        item.className = 'orgao-item';
        item.innerHTML = `
          <div class="orgao-item-nome">${orgao.nome}</div>
          <div class="orgao-item-bairro">📍 ${orgao.bairro}</div>
        `;
        
        item.addEventListener('click', function() {
          // Find the exact marker for this organ
          const matchingMarker = SMS_MARKERS.find(marker => 
            marker.attributes.nome === orgao.nome
          );

          if (matchingMarker) {
            // Zoom to marker on map
            view.goTo({
              target: matchingMarker.geometry,
              zoom: 16
            });

            // Highlight the marker
            setTimeout(() => {
              showInfoPanel(orgao);
            }, 500);
          } else {
            // Fallback: zoom to coordinates
            view.goTo({
              target: {
                x: orgao.longitude,
                y: orgao.latitude
              },
              zoom: 16
            });
            showInfoPanel(orgao);
          }
          
          // Close sidebar on mobile
          if (window.innerWidth < 768) {
            sidebar.classList.add("hidden");
            sidebarOpenBtn.classList.add("visible");
          }
        });
        
        orgaosList.appendChild(item);
      });
    }

    // Initial render (sem SMS)
    renderOrgaos(otherUnits);

    // Search functionality
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase().trim();
      
      if (!query) {
        renderOrgaos(otherUnits);
        return;
      }

      const filtered = otherUnits.filter(orgao => 
        orgao.nome.toLowerCase().includes(query) ||
        orgao.bairro.toLowerCase().includes(query) ||
        (orgao.titular && orgao.titular.toLowerCase().includes(query))
      );

      renderOrgaos(filtered);
    });
    
    // Adicionar SMS ao topo da sidebar para clicar
    if (smsUnit) {
      const smsButton = document.querySelector('.sidebar-section:has(h3:contains("SMS"))');
      if (!smsButton) {
        // Adicionar clique no SMS se necessário
        const smsSection = document.querySelector('h3');
        if (smsSection && smsSection.textContent.includes('SMS')) {
          smsSection.parentElement.style.cursor = 'pointer';
          smsSection.parentElement.addEventListener('click', function() {
            // Zoom to SMS marker
            const smsMarker = SMS_MARKERS.find(marker => marker.attributes.nome === "SMS");
            if (smsMarker) {
              view.goTo({
                target: smsMarker.geometry,
                zoom: 16
              });
              setTimeout(() => {
                showInfoPanel(smsUnit);
              }, 500);
            }
          });
        }
      }
    }
  }

  // Adicionar marcador SMS
  function addSMSMarker(locationData) {
    try {
      const point = new Point({
        longitude: locationData.longitude,
        latitude: locationData.latitude
      });

      const markerSymbol = new SimpleMarkerSymbol({
        color: [226, 119, 40], // Laranja
        size: 15, // Aumentado de 12
        outline: {
          color: [255, 255, 255],
          width: 2.5
        }
      });

      const graphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: {
          tipo: 'sms',
          ...locationData
        }
      });

      view.graphics.add(graphic);
      SMS_MARKERS.push(graphic);
    } catch (error) {
      console.error('✗ Erro ao adicionar marcador SMS:', error);
    }
  }

  // Carregar marcadores de bairros
  function loadNeighborhoodMarkers() {
    console.log('Carregando marcadores de bairros...');

    fetch('bairros_rio.json')
      .then(response => response.json())
      .then(data => {
        console.log(`✓ ${data.features.length} bairros carregados`);
        
        data.features.forEach(feature => {
          addBairroMarker(feature);
        });
      })
      .catch(error => console.error('✗ Erro ao carregar bairros:', error));
  }

  // Adicionar marcador de bairro
  function addBairroMarker(feature) {
    try {
      const coords = feature.geometry.coordinates;
      const props = feature.properties;

      const point = new Point({
        longitude: coords[0],
        latitude: coords[1]
      });

      const bairroSymbol = new SimpleMarkerSymbol({
        color: [0, 122, 194],
        size: 8,
        outline: {
          color: [255, 255, 255],
          width: 1
        }
      });

      const graphic = new Graphic({
        geometry: point,
        symbol: bairroSymbol,
        attributes: {
          tipo: 'bairro',
          nome: props.nome,
          regiao: props.regiao,
          populacao: props.populacao
        }
      });

      view.graphics.add(graphic);
      BAIRRO_MARKERS.push(graphic);
    } catch (error) {
      console.error('✗ Erro ao adicionar marcador de bairro:', error);
    }
  }

  // Handler de clique
  function setupClickHandler() {
    view.on("click", function(event) {
      view.hitTest(event).then(function(response) {
        if (response.results.length) {
          const hitGraphic = response.results[0].graphic;
          if (hitGraphic.attributes && hitGraphic.attributes.tipo) {
            showInfoPanel(hitGraphic.attributes);
          }
        }
      });
    });
  }

  // Exibir painel de informações - IMPROVED
  function showInfoPanel(data) {
    let telefoneLink = data.telefone ? `<a href="tel:${data.telefone}">${data.telefone}</a>` : '-';
    let emailLink = data.email ? `<a href="mailto:${data.email}">${data.email}</a>` : '-';
    
    infoPanelContent.innerHTML = `
      <div class="info-header">
        <h3>${data.nome || "Informação"}</h3>
        <span class="bairro-badge">${data.bairro}</span>
      </div>

      <div class="info-field">
        <div class="info-label">Titular</div>
        <div class="info-value">${data.titular || '-'}</div>
      </div>

      <div class="info-field">
        <div class="info-label">Cargo</div>
        <div class="info-value">${data.cargo || '-'}</div>
      </div>

      <div class="info-field">
        <div class="info-label">Endereço</div>
        <div class="info-value">${data.endereco || '-'}</div>
      </div>

      <div class="info-field">
        <div class="info-label">Telefone</div>
        <div class="info-value">${telefoneLink}</div>
      </div>

      <div class="info-field">
        <div class="info-label">Email</div>
        <div class="info-value">${emailLink}</div>
      </div>

      <div class="info-field">
        <div class="info-label">Coordenadas</div>
        <div class="info-value">${data.latitude?.toFixed(4)}, ${data.longitude?.toFixed(4)}</div>
      </div>
    `;
    infoPanel.classList.add("active");
  }

  // API pública
  window.clearMarkers = function() {
    SMS_MARKERS.forEach(marker => view.graphics.remove(marker));
    BAIRRO_MARKERS.forEach(marker => view.graphics.remove(marker));
    SMS_MARKERS.length = 0;
    BAIRRO_MARKERS.length = 0;
    infoPanel.classList.remove("active");
  };

  window.addSMSMarkers = function(locationsArray) {
    locationsArray.forEach(location => addSMSMarker(location));
  };

  window.addSMSMarker = function(location) {
    addSMSMarker(location);
  };

  // Inicializar quando view estiver pronto
  view.when(function() {
    console.log('✓ View pronto!');
    loadRioStateLayer();
    loadSMSMarkers();
    loadNeighborhoodMarkers();
    setupClickHandler();
    console.log('✓ Aplicação inicializada com sucesso!');
  }).catch(error => {
    console.error('✗ Erro ao inicializar view:', error);
  });

});

