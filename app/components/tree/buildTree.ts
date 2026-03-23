import { Person } from "../../types/family";

export type ComputedFamily = {
  id: string;
  primary: Person;
  spouse: Person | null;
  children: ComputedFamily[];
  isDuplicatePrimary?: boolean;
};

export function buildTree(people: Person[]): ComputedFamily[] {
  const processedFamilies = new Set<string>();

  function getFamiliesForPerson(person: Person): ComputedFamily[] {
    const spouses = people.filter(p => person.spouses?.includes(p.id) || p.spouses?.includes(person.id));
    const allChildren = people.filter(p => p.parents?.includes(person.id));
    
    const families: ComputedFamily[] = [];
    const childrenBySpouse = new Map<string, Person[]>();
    const unassignedChildren: Person[] = [];

    allChildren.forEach(child => {
       const childSpouseParents = child.parents?.filter(pid => pid !== person.id && spouses.some(s => s.id === pid)) || [];
       if (childSpouseParents.length > 0) {
          const sId = childSpouseParents[0];
          if (!childrenBySpouse.has(sId)) childrenBySpouse.set(sId, []);
          childrenBySpouse.get(sId)!.push(child);
       } else if (spouses.length === 1) {
          const sId = spouses[0].id;
          if (!childrenBySpouse.has(sId)) childrenBySpouse.set(sId, []);
          childrenBySpouse.get(sId)!.push(child);
       } else {
          unassignedChildren.push(child);
       }
    });

    let foundPrimary = false;

    spouses.forEach(spouse => {
       const famId = [person.id, spouse.id].sort().join("_");
       if (processedFamilies.has(famId)) return;
       processedFamilies.add(famId);

       const famChildren = childrenBySpouse.get(spouse.id) || [];
       const childFams: ComputedFamily[] = [];
       const sortedFamChildren = people.filter(p => famChildren.some(fc => fc.id === p.id));
       
       sortedFamChildren.forEach(child => {
          childFams.push(...getFamiliesForPerson(child));
       });

       families.push({
          id: famId,
          primary: person,
          spouse: spouse,
          children: childFams,
          isDuplicatePrimary: foundPrimary,
       });
       foundPrimary = true;
    });

    if (unassignedChildren.length > 0 || spouses.length === 0) {
       const famId = `single_${person.id}`;
       if (!processedFamilies.has(famId)) {
          processedFamilies.add(famId);
          const childFams: ComputedFamily[] = [];
          const sortedUnassigned = people.filter(p => unassignedChildren.some(uc => uc.id === p.id));
          sortedUnassigned.forEach(child => {
             childFams.push(...getFamiliesForPerson(child));
          });
          families.push({
             id: famId,
             primary: person,
             spouse: null,
             children: childFams,
             isDuplicatePrimary: foundPrimary,
          });
       }
    }

    return families;
  }

  const rootPeople = people.filter(p => {
     if (p.parents && p.parents.length > 0) return false;
     const spouses = people.filter(s => p.spouses?.includes(s.id) || s.spouses?.includes(p.id));
     const hasSpouseWithParents = spouses.some(s => s.parents && s.parents.length > 0);
     if (hasSpouseWithParents) return false;
     return true;
  });
  
  const rootFamilies: ComputedFamily[] = [];
  
  rootPeople.forEach(r => {
     rootFamilies.push(...getFamiliesForPerson(r));
  });

  return rootFamilies;
}
