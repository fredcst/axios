const createConversation = async () => {
  try {
    const response = await axios.post<Conversation>('/api/conversation', {});
    if (response.data.id) {
      setConversations([...conversations, response.data]);
      setError(null);
      setSelectedConversation(response.data);
      return response.data; // Devuelve la conversación creada
    } else {
      setError('Error creating conversation');
    }
  } catch (error) {
    setError('Error creating conversation');
  }
};

const handleSend = async () => {
  if (!input) {
    return;
  }

  setMessages([...messages, { input, output: '', id: -1, attachment: attachments[0]?.name }]);
  setInput('');
  setAttachments([]);

  if (!selectedConversation) {
    const newConversation = await createConversation();
    if (newConversation?.id) {
      sendMessageStream(newConversation.id);
    }
  } else {
    sendMessageStream(selectedConversation.id);
  }
};




💥 Tests de charge
	1.	Quels outils as-tu déjà utilisés pour faire des tests de charge (ex: JMeter, k6, Gatling…) ? Pourquoi les as-tu choisis ?
	2.	Comment interpréterais-tu une courbe de latence qui augmente progressivement pendant un test ?
	3.	As-tu déjà intégré des tests de charge dans une CI/CD ? Si oui, comment ?

⸻

🛡 Proxy, WAF
	4.	Peux-tu expliquer la différence entre un reverse proxy, un load balancer et un WAF ?
	5.	Quelles sont les bonnes pratiques pour configurer un WAF dans un environnement cloud ?
	6.	Comment réagirais-tu à une montée en charge de requêtes suspectes ? Comment analyser et bloquer proprement sans impacter les utilisateurs ?

⸻

☸ Kubernetes
	7.	Comment gères-tu la scalabilité d’une application sur Kubernetes ?
	8.	Quelle est la différence entre un Deployment et un StatefulSet ?
	9.	Décris une architecture Kubernetes multi-tenant sécurisée.
	10.	As-tu déjà effectué une migration vers Kubernetes ? Quels défis as-tu rencontrés ?

⸻

🌐 Réseaux
	11.	Explique la différence entre TCP et UDP et donne un cas d’usage pour chacun.
	12.	Comment sécuriserais-tu la communication entre des microservices répartis sur plusieurs VPC ?
	13.	Peux-tu expliquer ce qu’est un VPC peering et ses implications ?

⸻

☁️ Hébergement / Cloud
	14.	As-tu déjà migré une application d’un cloud vers un autre (ex: AWS vers GCP) ? Quels points critiques surveilles-tu ?
	15.	Quels sont les avantages et inconvénients du multi-cloud ?
	16.	Comment choisis-tu entre serverless, PaaS, ou IaaS selon un cas d’usage ?

⸻

🐚 Shell / scripting
	17.	Peux-tu écrire un script bash qui vérifie si un service est en ligne et redémarre s’il ne l’est pas ?
	18.	Quel est ton outil préféré pour automatiser des tâches système ? Pourquoi ?
	19.	As-tu déjà eu à parser des logs volumineux en Shell ? Quelle approche adoptes-tu ?

⸻

🐳 Docker
	20.	Quelle est la différence entre une image et un conteneur Docker ?
	21.	Comment sécuriserais-tu un conteneur Docker en production ?
	22.	Que se passe-t-il quand tu lances docker-compose up dans un projet multi-service ?

⸻

🔄 Migration d’applications & Collaboration
	23.	Comment planifies-tu une migration d’application critique vers un nouveau cloud ?
	24.	Quelles étapes clés vérifies-tu avant de couper l’accès à l’ancien environnement ?
	25.	Comment gères-tu la coordination entre développeurs, DevOps et sécurité lors d’une migration ?

⸻

🔍 Veille technologique & Leadership
	26.	Comment organises-tu ta veille technologique ? Quels outils ou méthodes utilises-tu ?
	27.	Donne un exemple où tu as introduit une nouvelle technologie dans ton équipe. Comment as-tu convaincu les autres ?
	28.	Comment gères-tu un désaccord technique entre membres de ton équipe ?

⸻

Souhaites-tu que je t’aide à créer une grille d’évaluation ou un scorecard pour noter les réponses en entretien ?


Voici les réponses attendues pour chaque question, adaptées à un poste de Tech Lead expérimenté :

⸻

💥 Tests de charge
	1.	Outils utilisés :
	•	Exemples : k6, JMeter, Gatling.
	•	Choix basé sur : intégration CI/CD, langage supporté (JS, Scala…), visualisation des résultats, support cloud.
	2.	Courbe de latence qui augmente :
	•	Signe de saturation des ressources (CPU, DB, réseau).
	•	Peut indiquer un goulot d’étranglement ou un problème de scalabilité.
	3.	Tests de charge en CI/CD :
	•	Utilisation de jobs spécifiques (GitLab CI, Jenkins, etc.).
	•	Seuils d’alerte définis.
	•	Phase de test de performance avant déploiement prod.

⸻

🛡 Proxy, WAF
	4.	Différences :
	•	Reverse proxy : répartit les requêtes vers les backend (ex: Nginx).
	•	Load balancer : distribue la charge (L4/L7).
	•	WAF : filtre les attaques (XSS, SQLi, etc.).
	5.	Bonnes pratiques :
	•	Mode d’apprentissage activé d’abord.
	•	Filtrage progressif avec logs.
	•	Déploiement as code (Terraform, Ansible).
	6.	Attaques en masse :
	•	Utilisation d’un rate limiting.
	•	Analyse avec des outils comme Fail2ban, Cloudflare, Elastic SIEM.
	•	Mise en quarantaine IP, adaptation dynamique du WAF.

⸻

☸ Kubernetes
	7.	Scalabilité :
	•	Horizontal (HPA), vertical (VPA).
	•	Utilisation de metrics-server + Prometheus.
	8.	Deployment vs StatefulSet :
	•	Deployment : stateless apps.
	•	StatefulSet : stockage persistant, identifiants stables.
	9.	Architecture multi-tenant :
	•	Namespaces, quotas de ressources.
	•	NetworkPolicies, RBAC.
	•	Isolation via PodSecurityPolicies ou Gatekeeper.
	10.	Migration vers Kubernetes :
	•	Challenge : découpage des applis monolithiques.
	•	Création de Dockerfiles, Helm charts, CI/CD.
	•	Problèmes rencontrés : configmaps/secrets mal gérés, observabilité.

⸻

🌐 Réseaux
	11.	TCP vs UDP :

	•	TCP : fiable, ordonné – ex : HTTP, SSH.
	•	UDP : rapide, pas fiable – ex : DNS, VoIP, jeux en ligne.

	12.	Sécurisation inter-microservices :

	•	Service mesh (Istio, Linkerd).
	•	Mutual TLS (mTLS), VPN, IAM cloud.

	13.	VPC Peering :

	•	Connexion réseau privée entre deux VPCs.
	•	Permet communication inter-cloud ou entre environnements (dev/prod).
	•	Attention aux routes, CIDR overlaps, latence.

⸻

☁️ Hébergement / Cloud
	14.	Migration cloud :

	•	Évaluation : dépendances, coûts, sécurité.
	•	Stratégies : lift & shift, re-platform, re-architect.
	•	Tests post-migration : perf, sécurité, monitoring.

	15.	Multi-cloud :

	•	✅ Avantages : haute dispo, indépendance fournisseur.
	•	❌ Inconvénients : complexité, coût, outillage, expertise requise.

	16.	Choix entre serverless, PaaS, IaaS :

	•	Serverless : rapide, pas de gestion infra (ex: fonctions simples, APIs).
	•	PaaS : gain de temps dev, pour apps standards.
	•	IaaS : plus de contrôle, pour besoins spécifiques.

⸻

🐚 Shell / scripting
	17.	Script bash simple :

if ! pgrep nginx > /dev/null; then
    systemctl restart nginx
fi

	18.	Outil préféré :

	•	cron, systemd, Ansible, ou bash selon cas.
	•	Pour tâches répétées, Ansible est plus maintenable.

	19.	Parsing de logs :

	•	grep, awk, sed, jq.
	•	Tri et agrégation par date, IP, erreur : grep ERROR | awk '{print $1}' | sort | uniq -c

⸻

🐳 Docker
	20.	Image vs Conteneur :

	•	Image = modèle.
	•	Conteneur = instance en cours d’exécution.

	21.	Sécurisation :

	•	User non-root, scan d’image (Trivy), policy OPA.
	•	Limiter les capacités (cap-drop), utiliser des réseaux isolés.

	22.	docker-compose up :

	•	Build ou pull des images.
	•	Création de réseaux, volumes, containers.
	•	Lancement en bon ordre avec dépendances si définies.

⸻

🔄 Migration & Collaboration
	23.	Plan de migration :

	•	Audit, POC, validation des dépendances.
	•	Stratégie (blue/green, canary, big bang).
	•	Rollback plan + communication.

	24.	Points clés avant coupure :

	•	Monitoring en place.
	•	Tests fonctionnels + performance validés.
	•	Plan de rollback.

	25.	Coordination inter-équipes :

	•	Rôles clairs, documentation.
	•	Outils de suivi (Jira, Notion, Confluence).
	•	Stand-ups synchronisés, rétro et partage post-migration.

⸻

🔍 Veille & Leadership
	26.	Organisation veille techno :

	•	RSS, newsletters, GitHub trending, conférences, meetups.
	•	Outils : Feedly, HackerNews, StackShare.

	27.	Exemple intro techno :

	•	Exemple : introduction de Kubernetes.
	•	Présentation des bénéfices, démonstration, support en migration.
	•	Accompagnement des équipes.

	28.	Gestion désaccords :

	•	Écoute active, reformulation.
	•	Rappel des objectifs communs.
	•	Test de plusieurs options si possible (POC).

⸻

Souhaites-tu que je t’aide à mettre tout ça dans un Google Doc, ou à en faire un questionnaire PDF prêt à imprimer ?