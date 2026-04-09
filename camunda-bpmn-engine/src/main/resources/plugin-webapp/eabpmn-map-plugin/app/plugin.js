function loadStyleOnce(id, href) {
  if (document.getElementById(id)) {
    return;
  }

  var link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function loadScriptOnce(id, src) {
  return new Promise(function(resolve, reject) {
    if (document.getElementById(id)) {
      return resolve();
    }

    var script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.onload = function() { resolve(); };
    script.onerror = function(e) { reject(e); };
    document.head.appendChild(script);
  });
}

function tryGetDiagramContainer(viewer) {
  try {
    var canvas = viewer.get('canvas');

    // bpmn-js Canvas#getContainer()
    if (canvas && typeof canvas.getContainer === 'function') {
      return canvas.getContainer();
    }
  } catch (e) {
    // ignore
  }

  return null;
}

var ENVIRONMENT_URL = '/environment.html';

export default {
  id: 'eabpmn-osm-sidepanel',
  pluginPoint: 'cockpit.processDefinition.diagram.plugin',
  priority: 0,
  render: function(viewer, data) {
    var diagramContainer = tryGetDiagramContainer(viewer);

    if (!diagramContainer || !diagramContainer.parentElement) {
      return;
    }

    var parent = diagramContainer.parentElement.parentElement.parentElement.parentElement.parentElement;
    var bpmnContainer = parent.children[1];
    bpmnContainer.style.width = '50%';

    // Avoid double-mount
    if (parent.querySelector('[data-eabpmn-osm-panel="true"]')) {
      return;
    }


    var panel = document.createElement('div');
    panel.setAttribute('data-eabpmn-osm-panel', 'true');
    panel.className = 'eabpmnMapPanel';


    var body = document.createElement('div');
    body.className = 'eabpmnMapPanelBody';

    // Embed your BEE (served separately)
    var iframe = document.createElement('iframe');
    iframe.className = 'eabpmnMapIframe';
    iframe.allow = 'clipboard-read; clipboard-write';
    iframe.referrerPolicy = 'no-referrer';

    var url = ENVIRONMENT_URL;
    iframe.src = url;

    body.appendChild(iframe);
    panel.appendChild(body);
    parent.appendChild(panel);

    // Expose context for future integration / postMessage wiring
    panel.__eabpmnProcessDefinitionId = data && data.processDefinitionId;
    panel.__eabpmnAppUrl = url;
    panel.__eabpmnIframe = iframe;


    // Cockpit plugin API supports optional unmount() for cleanup
    return {
     
    };
  }
};

