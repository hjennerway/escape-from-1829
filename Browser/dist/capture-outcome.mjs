// Snapshot of the Diagnoses and Causes tabs, read 24 September 2026.
// https://docs.google.com/spreadsheets/d/107LEc_YgAiATltfdQCZUXCjegXZBKlWfY2cmn6vOl44/edit
export const diagnoses=[
  {
    "name": "Dementia",
    "treatment": "Routine, occupation, exercise, diet and custodial care"
  },
  {
    "name": "Amentia",
    "treatment": "Primarily custodial care, routine and simple occupation"
  },
  {
    "name": "Epileptic insanity / Mania associated with epilepsy",
    "treatment": "Supervision, regulated routine and physical care; contemporary medicine had few effective treatments"
  },
  {
    "name": "Puerperal mania",
    "treatment": "Rest, nourishment, supervision and separation from stressful circumstances"
  },
  {
    "name": "Insanity following intemperance",
    "treatment": "Abstinence, diet, rest and institutional routine"
  },
  {
    "name": "Insanity following injury to the head",
    "treatment": "Rest, observation and physical treatment"
  },
  {
    "name": "Religious melancholia",
    "treatment": "Calm surroundings, distraction, occupation and attempts to redirect attention"
  },
  {
    "name": "Acute mania",
    "treatment": "Rest, quiet, close supervision and regular nourishment, followed by gentle occupation when calmer"
  },
  {
    "name": "Chronic mania",
    "treatment": "Structured routine, occupation, exercise and long-term custodial care"
  },
  {
    "name": "Melancholia",
    "treatment": "Rest, nourishment, companionship, supervision and gentle occupation or distraction"
  },
  {
    "name": "Monomania",
    "treatment": "Calm routine, occupation and attempts to divert attention from the dominant idea"
  }
];
export const causes=[
  {
    "name": "Fright",
    "description": "A sudden shock or terrifying event, believed to disturb the nerves and bring on mental disorder."
  },
  {
    "name": "Grief",
    "description": "Prolonged sorrow, usually following bereavement or loss, thought to overwhelm the mind."
  },
  {
    "name": "Religious Excitement",
    "description": "Intense religious feeling, revival activity or anxiety about sin, believed to over-stimulate the mind."
  },
  {
    "name": "Ill-treatment by relatives",
    "description": "Abuse, cruelty or sustained mistreatment within the family, recorded as causing mental distress."
  },
  {
    "name": "Poverty",
    "description": "Hardship, hunger and insecure living conditions, thought to weaken both body and mind."
  },
  {
    "name": "Intemperance",
    "description": "Habitual excessive drinking, usually alcohol, believed to damage the brain and provoke insanity."
  },
  {
    "name": "Injury to head",
    "description": "A blow or other head trauma, thought to impair the brain and alter behaviour."
  },
  {
    "name": "Passion",
    "description": "Powerful or uncontrolled emotion, such as anger or jealousy, believed to upset mental balance."
  },
  {
    "name": "Love",
    "description": "Intense or unrequited affection, thought capable of producing emotional turmoil and mental illness."
  },
  {
    "name": "Loss of property",
    "description": "Financial ruin or loss of land, goods or livelihood, thought to cause severe mental shock."
  },
  {
    "name": "Dread of poverty",
    "description": "Persistent fear of destitution or financial collapse, believed to produce anxiety and mental breakdown."
  },
  {
    "name": "Disappointment in marriage",
    "description": "Distress following rejection, a broken engagement or an unhappy marriage, thought to precipitate insanity."
  },
  {
    "name": "Coup de soleil",
    "description": "Sunstroke or severe illness caused by exposure to the sun, believed to affect the brain."
  },
  {
    "name": "Debility from pthisis",
    "description": "Weakness and wasting caused by phthisis, usually pulmonary tuberculosis, thought to leave the nervous system vulnerable."
  }
];

export function captureOutcome(previousDiagnosis,random=Math.random){
 const choices=diagnoses.filter(d=>d.name!==previousDiagnosis);
 const diagnosis=choices[Math.floor(random()*choices.length)];
 const cause=causes[Math.floor(random()*causes.length)];
 return {diagnosis:diagnosis.name,text:`Diagnosis: ${diagnosis.name}\n\nTreatment: ${diagnosis.treatment}\n\nSupposed cause: ${cause.name} — ${cause.description}\n\nTry again for a different diagnosis and treatment.`};
}

