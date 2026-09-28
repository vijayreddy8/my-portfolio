const projects = {
  erpnext: {
    title: 'ERPNext on AWS EKS',
    subtitle: 'Containerized ERPNext/Frappe platform with persistent storage and Kubernetes observability.',
    tags: ['AWS EKS','Kubernetes','Docker','ERPNext / Frappe','MariaDB','Redis','EFS','LoadBalancer','Helm','Prometheus','Grafana','Alertmanager'],
    process: ['Prepared the ERPNext/Frappe workloads and Kubernetes manifests.', 'Deployed the application in an erpnext namespace with frontend, two backend replicas, MariaDB and Redis services.', 'Used EFS-backed RWX persistent volumes for ERPNext sites/logs and persistent storage for MariaDB.', 'Exposed the frontend through an AWS LoadBalancer and validated the public application.', 'Installed the kube-prometheus-stack with Prometheus/Grafana and validated namespace metrics.'],
    challenges: ['Frontend Service targetPort needed to match the NGINX listener on 8080.', 'Investigated backend HTTP 500 responses and asset mapping issues.', 'Validated installed apps and generated asset mappings for Frappe/ERPNext.', 'Adjusted resource requests/limits and verified normal Kubernetes rollout behaviour.'],
    architecture: ['GitHub / YAML','AWS EKS','NGINX Frontend','ERPNext Backend ×2','MariaDB','Redis Cache / Queue','EFS / PVC','AWS LoadBalancer'],
    images: ['assets/erpnext/proof-1.png','assets/erpnext/proof-2.png','assets/erpnext/proof-3.png','assets/erpnext/proof-4.png']
  },
  ecommerce: {
    title: 'Clothes E-Commerce on AWS EKS',
    subtitle: 'Dockerized e-commerce application deployed to EKS with ECR, MySQL persistence and GitHub Actions CI/CD.',
    tags: ['AWS EKS','Docker','Amazon ECR','Kubernetes','GitHub Actions','GitHub OIDC','MySQL','EBS','Prometheus','Grafana'],
    process: ['Built and tagged the application Docker image and stored the deployment image in Amazon ECR.', 'Connected kubectl to the existing EKS cluster and used a managed node group.', 'Deployed the application and MySQL with Kubernetes YAML manifests, ConfigMap, Secret and Services.', 'Used a MySQL PVC backed by AWS EBS for persistent database storage.', 'Configured a LoadBalancer Service to provision an AWS Elastic Load Balancer.', 'Built a GitHub Actions workflow for the EKS deployment and verified successful workflow runs.'],
    challenges: ['The MySQL PVC initially remained Pending because the EBS CSI driver was not ready to provision storage.', 'Configured the AWS EBS CSI add-on and EKS Pod Identity with an IAM role carrying the required EBS permissions.', 'Fixed a Kubernetes YAML parsing/configuration issue in the Deployment.', 'Debugged container registry authentication and iterated on unique Docker image tags in CI/CD.'],
    architecture: ['GitHub','GitHub Actions','Docker','Amazon ECR','AWS EKS','LoadBalancer','E-Commerce Pod','MySQL Service','MySQL Pod','PVC → EBS'],
    images: ['assets/ecommerce/live-store.png','assets/ecommerce/eks-cluster.png','assets/ecommerce/github-actions.png','assets/ecommerce/grafana-node.png','assets/ecommerce/cloudshell.png']
  }
};

const detail = document.getElementById('project-detail');
document.querySelectorAll('.project-card').forEach(card => card.addEventListener('click', () => openProject(card.dataset.project)));
function openProject(key){
  const p = projects[key];
  detail.innerHTML = `<div class="detail-shell"><div class="detail-top"><div><div class="project-tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div><h3>${p.title}</h3><p style="color:#9ca7b8">${p.subtitle}</p></div><button class="close-detail" onclick="closeProject()">Close ×</button></div><div class="detail-grid"><div><div class="detail-block"><h4>Architecture</h4><div class="detail-arch">${p.architecture.map((x,i)=>`${i?'<span>→</span>':''}<span class="arch-pill">${x}</span>`).join('')}</div></div><div class="detail-block"><h4>What I did</h4><ul>${p.process.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="detail-block"><h4>Challenges & troubleshooting</h4><ul>${p.challenges.map(x=>`<li>${x}</li>`).join('')}</ul></div></div><div class="detail-block"><h4>Proof</h4><div class="detail-gallery">${p.images.map(src=>`<img src="${src}" alt="${p.title} proof" loading="lazy">`).join('')}</div></div></div></div>`;
  detail.scrollIntoView({behavior:'smooth',block:'start'});
  detail.querySelectorAll('img').forEach(img=>img.addEventListener('click',()=>openLightbox(img.src)));
}
function closeProject(){detail.innerHTML='';document.getElementById('projects').scrollIntoView({behavior:'smooth'});}

const form=document.getElementById('contact-form');
form.addEventListener('submit',async(e)=>{e.preventDefault();const status=document.getElementById('form-status');const button=form.querySelector('button');button.disabled=true;status.className='form-status';status.textContent='Sending…';try{const data=Object.fromEntries(new FormData(form));const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const j=await r.json();if(!r.ok)throw new Error(j.message);status.className='form-status success';status.textContent='✓ '+j.message;form.reset()}catch(err){status.className='form-status error';status.textContent='✕ '+err.message}finally{button.disabled=false}});

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const nav=document.querySelector('.nav');document.querySelector('.nav-toggle').addEventListener('click',()=>nav.classList.toggle('menu-open'));document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('menu-open')));
const dot=document.querySelector('.cursor-dot'),ring=document.querySelector('.cursor-ring');document.addEventListener('mousemove',e=>{dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';ring.animate({left:e.clientX+'px',top:e.clientY+'px'},{duration:220,fill:'forwards'})});document.querySelectorAll('a,button,.project-card,.gallery-grid img').forEach(el=>{el.addEventListener('mouseenter',()=>ring.classList.add('hover'));el.addEventListener('mouseleave',()=>ring.classList.remove('hover'))});
function openLightbox(src){const box=document.createElement('div');box.className='lightbox';box.innerHTML=`<button>Close ×</button><img src="${src}" alt="Project screenshot">`;box.addEventListener('click',e=>{if(e.target===box||e.target.tagName==='BUTTON')box.remove()});document.body.appendChild(box)}
