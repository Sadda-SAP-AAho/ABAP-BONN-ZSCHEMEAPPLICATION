@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
@EndUserText.label: 'CDS View forzsoscheme'
define root view entity ZR_zsoscheme01TP
  as select from zsoscheme as zsoscheme
  composition [0..*] of ZR_zsoschemelinesTP as _zsoschemelines
{
  @EndUserText.label: 'Company'
  key bukrs as Bukrs,
  @EndUserText.label: 'Sales Order'
  key salesorder as Salesorder,
  @EndUserText.label: 'Scheme Code'
  key schemecode as Schemecode,
  @EndUserText.label: 'Scheme Group Code'
  key schemegroupcode as Schemegroupcode,
  @EndUserText.label: 'Scheme combination'
  schemecheckcode as Schemecheckcode,
  @EndUserText.label: 'Order Qty'
  orderqty as Orderqty,
  @EndUserText.label: 'Free Qty'
  freeqty as Freeqty,
  @EndUserText.label: 'Applied Qty'
  appliedqty as Appliedqty,
  @Semantics.user.createdBy: true
  created_by as CreatedBy,
  @Semantics.systemDateTime.createdAt: true
  created_at as CreatedAt,
  last_changed_by as LastChangedBy,
  @Semantics.systemDateTime.localInstanceLastChangedAt: true
  last_changed_at as LastChangedAt,
  @Semantics.systemDateTime.lastChangedAt: true
  local_last_changed_at as LocalLastChangedAt,
  _zsoschemelines
  
}
