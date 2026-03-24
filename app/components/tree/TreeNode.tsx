import React from "react";
import { Person } from "../../types/family";
import { ComputedFamily } from "./buildTree";
import { GEN_DIMS } from "./constants";
import { PersonCard } from "./PersonCard";

export function TreeNode({ 
  node, onEdit, onQuickAdd, onView, isAdmin
}: { 
  node: ComputedFamily; 
  onEdit?: (p: Person) => void, 
  onQuickAdd?: (type: 'child'|'sibling'|'sibling-before'|'spouse', p: Person) => void;
  onView?: (p: Person) => void;
  isAdmin?: boolean;
}) {
  const dims = GEN_DIMS[node.primary.generation];
  return (
    <li>
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center" }}>
        {node.isDuplicatePrimary ? (
           <div style={{ width: dims.cardW, height: dims.cardW, position: "relative" }} />
        ) : (
           <PersonCard person={node.primary} onEdit={onEdit} onQuickAdd={onQuickAdd} onView={onView} isAdmin={isAdmin}/>
        )}
        
        {node.spouse && (
          <>
            <div style={{ width: 24, height: 2, background: "var(--ft-border)", flexShrink: 0 }} />
            <PersonCard person={node.spouse} onEdit={onEdit} onQuickAdd={onQuickAdd} onView={onView} isAdmin={isAdmin}/>
          </>
        )}
      </div>
      {node.children.length > 0 && (
        <ul>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} onEdit={onEdit} onQuickAdd={onQuickAdd} onView={onView} isAdmin={isAdmin}/>
          ))}
        </ul>
      )}
    </li>
  );
}
