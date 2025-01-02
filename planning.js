document.addEventListener("deviceready", function () {
  console.log("Device ready - Initialisation de l'application");

  // Initialisation du plugin SecureStorage
  const secureStorage = new cordova.plugins.SecureStorage(
    () => console.log("Secure Storage initialisé avec succès"),
    (error) => console.error("Erreur lors de l'initialisation de Secure Storage :", error),
    "ClimbMatePlanning"
  );

  const membersForm = document.getElementById("members-form");
  const membersList = document.getElementById("members-list");
  const groupsForm = document.getElementById("groups-form");
  const groupsList = document.getElementById("groups-list");
  const groupSelect = document.getElementById("group-select");
  const planningForm = document.getElementById("planning-form");
  const tripsContainer = document.getElementById("trips-container");

  // Gestion des membres
  membersForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const memberName = document.getElementById("member-name").value.trim();
    if (!memberName) return;

    // Récupérer les membres déjà existants dans le stockage sécurisé
    secureStorage.get(
      (data) => {
        const members = JSON.parse(data) || [];
        members.push(memberName); // Ajouter le nouveau membre
        saveData("members", members, () => {
          updateMembersList(members); // Mettre à jour l'affichage des membres
        });
      },
      () => {
        // Si aucun membre n'existe, créer une nouvelle liste avec le membre
        const newMember = [memberName];
        saveData("members", newMember, () => {
          updateMembersList(newMember); // Mettre à jour l'affichage des membres
        });
      },
      "members"
    );
  });

  // Fonction pour mettre à jour l'affichage des membres
  function updateMembersList(members) {
    membersList.innerHTML = ""; // Réinitialiser la liste des membres
    members.forEach(member => {
      const li = document.createElement("li");
      li.textContent = member;
      membersList.appendChild(li); // Ajouter chaque membre à la liste
    });
  }

  // Gestion des groupes
  groupsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const groupName = document.getElementById("group-name").value.trim();
    if (!groupName) return;

    // Ajouter un groupe dans le stockage sécurisé
    secureStorage.get(
      (data) => {
        const groups = JSON.parse(data) || [];
        groups.push(groupName);
        saveData("groups", groups, () => {
          updateGroupsList(groups);
          updateGroupSelect(groups);
        });
      },
      () => {
        const newGroup = [groupName];
        saveData("groups", newGroup, () => {
          updateGroupsList(newGroup);
          updateGroupSelect(newGroup);
        });
      },
      "groups"
    );
  });

  // Fonction pour mettre à jour la liste des groupes
  function updateGroupsList(groups) {
    groupsList.innerHTML = groups.map(group => `<li>${group}</li>`).join("");
  }

  // Fonction pour mettre à jour le select des groupes
  function updateGroupSelect(groups) {
    groupSelect.innerHTML = `<option value="">Choisir un groupe</option>` + groups.map((group) => `<option value="${group}">${group}</option>`).join("");
  }

  // Planification des sorties
  planningForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const location = document.getElementById("location").value.trim();
    const date = document.getElementById("date").value.trim();
    const group = groupSelect.value;

    if (!location || !date || !group) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    // Ajouter une sortie planifiée dans le stockage sécurisé
    secureStorage.get(
      (data) => {
        const trips = JSON.parse(data) || [];
        trips.push({ location, date, group });
        saveData("plannedTrips", trips, () => displayPlannedTrips(trips));
      },
      () => saveData("plannedTrips", [{ location, date, group }], () => displayPlannedTrips([{ location, date, group }])),
      "plannedTrips"
    );
  });

  // Fonction pour afficher les sorties planifiées
  function displayPlannedTrips(trips) {
    tripsContainer.innerHTML = trips
      .map((trip) => `<div class="trip"><h3>${trip.location} (${trip.date})</h3><p>Groupe : ${trip.group}</p></div>`)
      .join("");
  }

  // Sauvegarde des données dans le Secure Storage
  function saveData(key, data, onSuccess) {
    secureStorage.set(
      () => onSuccess(),
      (error) => console.error(`Erreur lors de la sauvegarde de ${key} :`, error),
      key,
      JSON.stringify(data)
    );
  }

  // Chargement initial des données
  secureStorage.get(
    (data) => {
      const members = JSON.parse(data);
      updateMembersList(members); // Mise à jour de la liste des membres
    },
    () => console.log("Aucun membre trouvé."),
    "members"
  );

  secureStorage.get(
    (data) => {
      const groups = JSON.parse(data);
      updateGroupsList(groups);
      updateGroupSelect(groups);
    },
    () => console.log("Aucun groupe trouvé."),
    "groups"
  );

  secureStorage.get(
    (data) => displayPlannedTrips(JSON.parse(data)),
    () => console.log("Aucune sortie planifiée."),
    "plannedTrips"
  );
});
