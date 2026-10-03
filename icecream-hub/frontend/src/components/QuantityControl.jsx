export default function QuantityControl({ quantity, onAdd, onRemove, disabled }) {
  if (quantity === 0) {
    return (
      <button className="btn btn-outline btn-sm add-btn" onClick={onAdd} disabled={disabled}>
        ADD
      </button>
    );
  }
  return (
    <div className="qty-control">
      <button onClick={onRemove} aria-label="Remove one">−</button>
      <span>{quantity}</span>
      <button onClick={onAdd} disabled={disabled} aria-label="Add one">+</button>
    </div>
  );
}
