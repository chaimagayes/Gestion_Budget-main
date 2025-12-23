import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const categoriesDisponibles = [
    "Courses",
    "Transport",
    "Logement",
    "Restaurant",
    "Loisirs",
    "Santé",
    "Autre",
  ];

  // ---------------------- STATE PRINCIPAL ----------------------
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            type: "dépense",
            categorie: "Courses",
            montant: -50,
            date: "11/12/2025",
          },
          {
            id: 2,
            type: "revenu",
            categorie: "Salaire",
            montant: 1500,
            date: "05/12/2025",
          },
          {
            id: 3,
            type: "dépense",
            categorie: "Transport",
            montant: -20,
            date: "10/12/2025",
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const [type, setType] = useState("dépense");
  const [categorie, setCategorie] = useState(categoriesDisponibles[0]);
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState("");

  const [filtreType, setFiltreType] = useState("tous");
  const [search, setSearch] = useState("");

  // filtre de date (période)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [budgetMensuel, setBudgetMensuel] = useState(1000);

  // pour modification
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState("dépense");
  const [editingCategorie, setEditingCategorie] = useState(categoriesDisponibles[0]);
  const [editingMontant, setEditingMontant] = useState("");
  const [editingDate, setEditingDate] = useState("");

  // ---------------------- CALCULS KPIs ----------------------
  const solde = transactions.reduce((total, t) => total + t.montant, 0);

  const totalRevenus = transactions
    .filter((t) => t.montant > 0)
    .reduce((sum, t) => sum + t.montant, 0);

  const totalDepenses = transactions
    .filter((t) => t.montant < 0)
    .reduce((sum, t) => sum + t.montant, 0);

  const nombreTransactions = transactions.length;

  const maintenant = new Date();
  const moisCourant = maintenant.getMonth() + 1;
  const anneeCourante = maintenant.getFullYear();

  const depensesMoisCourant = transactions
    .filter((t) => {
      if (t.montant >= 0) return false;
      const [jour, mois, annee] = t.date.split("/");
      return Number(mois) === moisCourant && Number(annee) === anneeCourante;
    })
    .reduce((sum, t) => sum + Math.abs(t.montant), 0);

  const pourcentageBudget =
    budgetMensuel > 0 ? Math.min((depensesMoisCourant / budgetMensuel) * 100, 999) : 0;

  let budgetClasse = "budget-ok";
  if (pourcentageBudget >= 80) budgetClasse = "budget-bad";
  else if (pourcentageBudget >= 50) budgetClasse = "budget-mid";

  // ---------------------- FILTRES ----------------------
  const transactionsFiltrees = transactions.filter((t) => {
    const okType = filtreType === "tous" ? true : t.type === filtreType;
    const texte = (t.categorie + " " + t.type).toLowerCase();
    const okSearch = texte.includes(search.toLowerCase());

    let okDate = true;
    if (startDate) {
      const ts = new Date(startDate);
      const [j, m, a] = t.date.split("/");
      const td = new Date(`${a}-${m}-${j}`);
      okDate = td >= ts;
    }
    if (okDate && endDate) {
      const te = new Date(endDate);
      const [j, m, a] = t.date.split("/");
      const td = new Date(`${a}-${m}-${j}`);
      okDate = td <= te;
    }

    return okType && okSearch && okDate;
  });

  // ---------------------- STAT PAR CATÉGORIE ----------------------
  const depensesParCategorie = {};
  transactions.forEach((t) => {
    if (t.montant >= 0) return;
    const cat = t.categorie || "Autre";
    if (!depensesParCategorie[cat]) depensesParCategorie[cat] = 0;
    depensesParCategorie[cat] += Math.abs(t.montant);
  });

  const topCategorie =
    Object.entries(depensesParCategorie).length > 0
      ? Object.entries(depensesParCategorie).reduce((max, entry) =>
          entry[1] > max[1] ? entry : max
        )
      : null;

  // ---------------------- STAT PAR MOIS (SOLDES) ----------------------
  const montantsParMois = {};
  transactions.forEach((t) => {
    const [jour, mois, annee] = t.date.split("/");
    const cle = `${mois}/${annee}`;
    if (!montantsParMois[cle]) montantsParMois[cle] = 0;
    montantsParMois[cle] += t.montant;
  });

  const donneesGraph = Object.entries(montantsParMois)
    .map(([mois, total]) => ({ mois, total }))
    .sort((a, b) => a.mois.localeCompare(b.mois));

  // ---------------------- FORMULAIRE AJOUT ----------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categorie || !montant || !date) return;

    const valeur = Number(montant);
    const montantFinal = type === "dépense" ? -Math.abs(valeur) : Math.abs(valeur);

    const nouvelleTransaction = {
      id: Date.now(),
      type,
      categorie,
      montant: montantFinal,
      date: new Date(date).toLocaleDateString("fr-FR"),
    };

    setTransactions((prev) => [...prev, nouvelleTransaction]);

    setMontant("");
    setDate("");
    setType("dépense");
    setCategorie(categoriesDisponibles[0]);
  };

  // ---------------------- SUPPRESSION ----------------------
  const supprimerTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // ---------------------- MODIFICATION ----------------------
  const lancerEdition = (transaction) => {
    setEditingId(transaction.id);
    setEditingType(transaction.type);
    setEditingCategorie(transaction.categorie);
    setEditingMontant(Math.abs(transaction.montant));
    // convertir "dd/mm/yyyy" -> "yyyy-mm-dd"
    const [j, m, a] = transaction.date.split("/");
    setEditingDate(`${a}-${m}-${j}`);
  };

  const annulerEdition = () => {
    setEditingId(null);
    setEditingType("dépense");
    setEditingCategorie(categoriesDisponibles[0]);
    setEditingMontant("");
    setEditingDate("");
  };

  const sauvegarderEdition = (e) => {
    e.preventDefault();
    if (!editingId || !editingCategorie || !editingMontant || !editingDate) return;

    const valeur = Number(editingMontant);
    const montantFinal =
      editingType === "dépense" ? -Math.abs(valeur) : Math.abs(valeur);

    const dateFr = new Date(editingDate).toLocaleDateString("fr-FR");

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? {
              ...t,
              type: editingType,
              categorie: editingCategorie,
              montant: montantFinal,
              date: dateFr,
            }
          : t
      )
    );

    annulerEdition();
  };

  // ---------------------- LOGOUT ----------------------
  const handleLogout = () => {
    // localStorage.removeItem("transactions"); // si tu veux vider au logout
    navigate("/"); // retour à la page de login
  };

  return (
    <div className="dash-container">
      <div className="dash-card">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">Vue globale de vos finances (TND)</p>
          </div>

          <button className="btn-logout" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>

        {/* ALERTE BUDGET */}
        {pourcentageBudget > 100 && (
          <div className="alert-budget">
            Attention : votre budget du mois est dépassé de{" "}
            {(depensesMoisCourant - budgetMensuel).toFixed(2)} TND.
          </div>
        )}

        <div className="solde-card">
          <p className="solde-label">Solde global</p>
          <p className="solde">{solde} TND</p>
        </div>

        <div className="kpi-row">
          <div className="kpi-card kpi-income">
            <p className="kpi-label">Revenus totaux</p>
            <p className="kpi-value">{totalRevenus} TND</p>
          </div>

          <div className="kpi-card kpi-expense">
            <p className="kpi-label">Dépenses totales</p>
            <p className="kpi-value">{totalDepenses} TND</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-label">Nombre de transactions</p>
            <p className="kpi-value">{nombreTransactions}</p>
          </div>
        </div>

        <div className="kpi-row">
          <div className={`kpi-card budget-card ${budgetClasse}`}>
            <p className="kpi-label">
              Budget du mois en cours (
              {moisCourant.toString().padStart(2, "0")}/{anneeCourante})
            </p>
            <p className="kpi-value">
              {depensesMoisCourant} TND / {budgetMensuel} TND
            </p>
            <div className="budget-bar-container">
              <div className="budget-bar-bg">
                <div
                  className="budget-bar-fill"
                  style={{ width: `${Math.min(pourcentageBudget, 100)}%` }}
                />
              </div>
              <span className="budget-bar-text">
                {pourcentageBudget.toFixed(1)} %
              </span>
            </div>
            <div className="budget-input-row">
              <span>Modifier le budget : </span>
              <input
                type="number"
                min="0"
                className="budget-input"
                value={budgetMensuel}
                onChange={(e) =>
                  setBudgetMensuel(Number(e.target.value) || 0)
                }
              />
              <span>TND</span>
            </div>
          </div>

          <div className="kpi-card">
            <p className="kpi-label">Top catégorie de dépense</p>
            {topCategorie ? (
              <>
                <p className="kpi-value">{topCategorie[0]}</p>
                <p className="kpi-label">Total : {topCategorie[1]} TND</p>
              </>
            ) : (
              <p className="kpi-label">Pas encore de dépenses</p>
            )}
          </div>
        </div>

        {/* FORMULAIRE AJOUT TRANSACTION */}
        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <select
              className="form-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="dépense">Dépense</option>
              <option value="revenu">Revenu</option>
            </select>

            <select
              className="form-input"
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
            >
              {categoriesDisponibles.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              className="form-input"
              type="number"
              placeholder="Montant en TND"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
            />

            <input
              className="form-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button type="submit" className="btn">
            Ajouter
          </button>
        </form>

        <div className="dash-main">
          {/* TABLEAU TRANSACTIONS + FILTRES */}
          <div className="transactions-card">
            <div className="filter-row">
              <select
                className="filter-select"
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
              >
                <option value="tous">Tous</option>
                <option value="revenu">Revenus</option>
                <option value="dépense">Dépenses</option>
              </select>

              <input
                className="filter-input"
                type="text"
                placeholder="Rechercher une catégorie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <input
                className="filter-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                className="filter-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <h2 className="transactions-title">Dernières transactions</h2>
            <div className="transactions">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Catégorie</th>
                    <th>Type</th>
                    <th>Montant</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsFiltrees.map((t) => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.categorie}</td>
                      <td>{t.type}</td>
                      <td className={t.type === "revenu" ? "rev" : "dep"}>
                        {t.montant} TND
                      </td>
                      <td>
                        <button
                          className="edit-btn"
                          type="button"
                          onClick={() => lancerEdition(t)}
                        >
                          ✎
                        </button>
                        <button
                          className="delete-btn"
                          type="button"
                          onClick={() => supprimerTransaction(t.id)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* GRAPHIQUES */}
          <div className="graph">
            <h2 className="graph-title">Évolution mensuelle (solde)</h2>
            <p className="graph-subtitle">Aperçu rapide des flux</p>

            <div className="mini-chart">
              {donneesGraph.map((item) => (
                <div key={item.mois} className="mini-bar-wrapper">
                  <div
                    className={
                      "mini-bar " +
                      (item.total >= 0 ? "mini-bar-pos" : "mini-bar-neg")
                    }
                    style={{
                      height: `${Math.min(Math.abs(item.total), 300) / 3 + 20}px`,
                    }}
                  />
                  <span className="mini-bar-label">{item.mois}</span>
                </div>
              ))}
            </div>

            <h2 className="graph-title" style={{ marginTop: "24px" }}>
              Dépenses par catégorie
            </h2>
            <div className="mini-chart">
              {Object.entries(depensesParCategorie).map(([cat, total]) => (
                <div key={cat} className="mini-bar-wrapper">
                  <div
                    className="mini-bar mini-bar-neg"
                    style={{
                      height: `${Math.min(total, 300) / 3 + 20}px`,
                    }}
                  />
                  <span className="mini-bar-label">{cat}</span>
                </div>
              ))}
              {Object.keys(depensesParCategorie).length === 0 && (
                <p style={{ fontSize: "12px", color: "#666" }}>
                  Pas encore de dépenses à afficher.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FORMULAIRE MODIFICATION (MODAL SIMPLE) */}
      {editingId && (
        <div className="edit-modal-backdrop">
          <div className="edit-modal">
            <h3>Modifier la transaction</h3>
            <form onSubmit={sauvegarderEdition}>
              <select
                className="form-input"
                value={editingType}
                onChange={(e) => setEditingType(e.target.value)}
              >
                <option value="dépense">Dépense</option>
                <option value="revenu">Revenu</option>
              </select>

              <select
                className="form-input"
                value={editingCategorie}
                onChange={(e) => setEditingCategorie(e.target.value)}
              >
                {categoriesDisponibles.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <input
                className="form-input"
                type="number"
                placeholder="Montant en TND"
                value={editingMontant}
                onChange={(e) => setEditingMontant(e.target.value)}
              />

              <input
                className="form-input"
                type="date"
                value={editingDate}
                onChange={(e) => setEditingDate(e.target.value)}
              />

              <div className="edit-modal-actions">
                <button type="button" onClick={annulerEdition}>
                  Annuler
                </button>
                <button type="submit" className="btn">
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
