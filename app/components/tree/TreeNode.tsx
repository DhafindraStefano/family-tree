import React from "react";
import { Person } from "../../types/family";
import { ComputedFamily } from "./buildTree";
import { GEN_DIMS } from "./constants";
import { PersonCard } from "./PersonCard";

export function TreeNode({ 
  node, onEdit, onQuickAdd, isAdmin
}: { 
  node: ComputedFamily; 
  onEdit?: (p: Person) => void, 
  onQuickAdd?: (type: 'child'|'sibling'|'sibling-before'|'spouse', p: Person) => void 
  isAdmin?: boolean;
}) {
  const dims = GEN_DIMS[node.primary.generation];
  return (
    <li>
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center" }}>
        {node.isDuplicatePrimary ? (
           <div style={{ width: dims.cardW, height: dims.cardW, position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", right: -12, width: "65%", height: 1.5, background: "#d6d3d1" }} />
           </div>
        ) : (
           <PersonCard person={node.primary} onEdit={onEdit} onQuickAdd={onQuickAdd} isAdmin={isAdmin}/>
        )}
        
        {node.spouse && (
          <>
            <div style={{ width: 24, height: 1, background: "#d6d3d1", flexShrink: 0 }} />
            <PersonCard person={node.spouse} onEdit={onEdit} onQuickAdd={onQuickAdd} isAdmin={isAdmin}/>
          </>
        )}
      </div>
      {node.children.length > 0 && (
        <ul>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} onEdit={onEdit} onQuickAdd={onQuickAdd} isAdmin={isAdmin}/>
          ))}
        </ul>
      )}
    </li>
  );
}
